import os
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from sqlalchemy.future import select as async_select
from sqlalchemy import func

from database import engine, Base, AsyncSessionLocal
from models import QuestionORM, QuizAttemptORM, EvaluationORM
from schemas import *
from services.question_service import (
    get_recent_question_texts, validate_and_retry_llm_call,
    validate_mcq_batch, validate_subjective_batch,
    save_mcq_questions_to_db, save_subjective_questions_to_db,
    get_quiz_questions, get_managerial_ratios
)
from services.evaluation_service import (
    evaluate_mcq_answer, evaluate_subjective_answer, save_evaluation_to_db
)
from utils.helpers import build_enhanced_prompt

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI App
app = FastAPI(title="Quiz Backend with Evaluation", version="2.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))

@app.on_event("startup")
async def startup():
    logger.info("Application started successfully")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Connected to the database on startup")

@app.on_event("shutdown")
async def shutdown():
    await engine.dispose()
    logger.info("Disconnected from the database on shutdown")

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/quiz", response_class=HTMLResponse)
async def quiz_page(request: Request):
    return templates.TemplateResponse("quiz.html", {"request": request})

# Question Generation Endpoints
@app.post("/generate_questions_batch/", response_model=List[QuestionOut])
async def generate_questions_batch(request: QuestionBatchRequest):
    try:
        recent = await get_recent_question_texts(
            request.topic, request.skill_type.value, request.managerial_level, n=15
        )
        
        prompt = build_enhanced_prompt(
            request.topic, 
            request.difficulty.value, 
            request.skill_type.value, 
            request.managerial_level,
            request.num_questions, 
            request.question_type.value, 
            avoid_questions=recent
        )
        
        batch = await validate_and_retry_llm_call(
            prompt, 
            max_retries=3,
            question_type=request.question_type.value
        )
        
        if request.question_type == QuestionType.mcq:
            valid_qs = validate_mcq_batch(batch)
            if not valid_qs:
                raise HTTPException(
                    status_code=500, 
                    detail="No valid MCQ questions could be generated. Please try again."
                )
            created = await save_mcq_questions_to_db(valid_qs, request)
        else:
            valid_qs = validate_subjective_batch(batch)
            if not valid_qs:
                raise HTTPException(
                    status_code=500, 
                    detail="No valid subjective questions could be generated. Please try again."
                )
            created = await save_subjective_questions_to_db(valid_qs, request)
        
        logger.info(f"Successfully generated {len(created)} questions")
        return created
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in question generation: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to generate questions: {str(e)}"
        )

@app.get("/questions/", response_model=List[QuestionOut])
async def list_questions(
    topic: Optional[str] = None,
    difficulty: Optional[DifficultyLevel] = None,
    skill_type: Optional[SkillType] = None,
    managerial_level: Optional[str] = None,
    question_type: Optional[QuestionType] = None,
    limit: int = 100
):
    query = async_select(QuestionORM)
    if topic:
        query = query.where(QuestionORM.topic == topic)
    if difficulty:
        query = query.where(QuestionORM.difficulty == difficulty.value)
    if skill_type:
        query = query.where(QuestionORM.skill_type == skill_type.value)
    if managerial_level:
        query = query.where(QuestionORM.managerial_level == managerial_level)
    if question_type:
        query = query.where(QuestionORM.type == question_type.value)
    
    query = query.order_by(QuestionORM.created_at.desc()).limit(limit)
    
    async with AsyncSessionLocal() as session:
        result = await session.execute(query)
        return result.scalars().all()

# Quiz Endpoints - FIXED: Added randomization
@app.post("/quiz/start/", response_model=List[QuestionForEvaluation])
async def start_quiz(request: QuizRequest):
    logger.info(f"Starting quiz with {request.num_questions} questions")
    
    if request.managerial_level:
        ratios = await get_managerial_ratios(request.managerial_level)
        if ratios:
            soft_skill_ratio = ratios['soft_skill_ratio']
            technical_ratio = ratios['technical_ratio']
            num_soft = int(round(request.num_questions * soft_skill_ratio / 100))
            num_tech = request.num_questions - num_soft
            
            async with AsyncSessionLocal() as session:
                # Get soft skill questions with RANDOM ordering
                query_soft = async_select(QuestionORM).where(QuestionORM.skill_type == "soft_skill")
                if request.topic:
                    query_soft = query_soft.where(QuestionORM.topic == request.topic)
                if request.difficulty:
                    query_soft = query_soft.where(QuestionORM.difficulty == request.difficulty.value)
                if request.question_type:
                    query_soft = query_soft.where(QuestionORM.type == request.question_type.value)
                # FIXED: Use random ordering instead of created_at
                query_soft = query_soft.order_by(func.random()).limit(num_soft)
                result_soft = await session.execute(query_soft)
                soft_questions = result_soft.scalars().all()

                # Get technical questions with RANDOM ordering
                query_tech = async_select(QuestionORM).where(QuestionORM.skill_type == "technical")
                if request.topic:
                    query_tech = query_tech.where(QuestionORM.topic == request.topic)
                if request.difficulty:
                    query_tech = query_tech.where(QuestionORM.difficulty == request.difficulty.value)
                if request.question_type:
                    query_tech = query_tech.where(QuestionORM.type == request.question_type.value)
                # FIXED: Use random ordering instead of created_at
                query_tech = query_tech.order_by(func.random()).limit(num_tech)
                result_tech = await session.execute(query_tech)
                tech_questions = result_tech.scalars().all()

                questions = list(soft_questions) + list(tech_questions)
                if not questions:
                    raise HTTPException(status_code=404, detail="No questions found matching the criteria")
                
                quiz_questions = []
                for q in questions:
                    quiz_questions.append(QuestionForEvaluation(
                        id=q.id,
                        question_text=q.question_text,
                        type=q.type,
                        topic=q.topic,
                        difficulty=q.difficulty,
                        skill_type=q.skill_type,
                        managerial_level=q.managerial_level,
                        options=q.options if q.type == "mcq" else None
                    ))
                logger.info(f"Retrieved {len(quiz_questions)} randomized questions for quiz (with managerial ratios)")
                return quiz_questions
    
    # Regular query without managerial ratios - ALSO RANDOMIZED
    query = async_select(QuestionORM)
    if request.topic:
        query = query.where(QuestionORM.topic == request.topic)
    if request.difficulty:
        query = query.where(QuestionORM.difficulty == request.difficulty.value)
    if request.skill_type:
        query = query.where(QuestionORM.skill_type == request.skill_type.value)
    if request.managerial_level:
        query = query.where(QuestionORM.managerial_level == request.managerial_level)
    if request.question_type:
        query = query.where(QuestionORM.type == request.question_type.value)
    
    # FIXED: Use random ordering instead of created_at
    query = query.order_by(func.random()).limit(request.num_questions)
    
    async with AsyncSessionLocal() as session:
        result = await session.execute(query)
        questions = result.scalars().all()
        
        if not questions:
            raise HTTPException(status_code=404, detail="No questions found matching the criteria")
        
        quiz_questions = []
        for q in questions:
            quiz_questions.append(QuestionForEvaluation(
                id=q.id,
                question_text=q.question_text,
                type=q.type,
                topic=q.topic,
                difficulty=q.difficulty,
                skill_type=q.skill_type,
                managerial_level=q.managerial_level,
                options=q.options if q.type == "mcq" else None
            ))
        logger.info(f"Retrieved {len(quiz_questions)} randomized questions for quiz")
        return quiz_questions

@app.post("/quiz/evaluate/", response_model=QuizEvaluationResponse)
async def evaluate_quiz(request: QuizEvaluationRequest):
    logger.info(f"Evaluating quiz with {len(request.answers)} answers")
    if not request.answers:
        raise HTTPException(status_code=400, detail="No answers provided")

    quiz_attempt_id = request.quiz_attempt_id
    if not quiz_attempt_id:
        user_id = request.answers[0].user_id if request.answers and request.answers[0].user_id else None
        if user_id:
            quiz_attempt = await create_quiz_attempt(
                QuizAttemptCreateRequest(
                    user_id=user_id,
                    num_questions=len(request.answers)
                )
            )
            quiz_attempt_id = quiz_attempt.id

    evaluations = []
    total_score = 0.0
    
    async with AsyncSessionLocal() as session:
        for user_answer in request.answers:
            try:
                query = async_select(QuestionORM).where(QuestionORM.id == user_answer.question_id)
                result = await session.execute(query)
                question = result.scalars().first()
                
                if not question:
                    logger.warning(f"Question {user_answer.question_id} not found")
                    continue
                
                if question.type == "mcq":
                    score, feedback, method = await evaluate_mcq_answer(question, user_answer.user_answer)
                else:
                    score, feedback, method = await evaluate_subjective_answer(question, user_answer.user_answer)
                
                await save_evaluation_to_db(
                    question.id,
                    user_answer.user_answer,
                    score,
                    feedback,
                    method,
                    user_answer.user_id,
                    quiz_attempt_id=quiz_attempt_id
                )
                
                evaluation_result = EvaluationResult(
                    question_id=question.id,
                    question_text=question.question_text,
                    user_answer=user_answer.user_answer,
                    correct_answer=question.answer,
                    score=score,
                    feedback=feedback,
                    is_correct=score >= 0.7,
                    evaluation_method=method
                )
                evaluations.append(evaluation_result)
                total_score += score
                logger.info(f"Evaluated question {question.id}: score={score:.2f}")
            except Exception as e:
                logger.error(f"Error evaluating question {user_answer.question_id}: {e}")
                continue
        
        # Update quiz_attempt with score and end time
        if quiz_attempt_id:
            attempt_obj = await session.get(QuizAttemptORM, quiz_attempt_id)
            if attempt_obj:
                attempt_obj.ended_at = datetime.utcnow()
                attempt_obj.score = total_score
                await session.commit()
    
    if not evaluations:
        raise HTTPException(status_code=400, detail="No valid evaluations could be performed")
    
    percentage_score = (total_score / len(evaluations)) * 100
    response = QuizEvaluationResponse(
        total_questions=len(evaluations),
        total_score=total_score,
        percentage_score=percentage_score,
        evaluations=evaluations,
        quiz_attempt_id=quiz_attempt_id
    )
    
    logger.info(f"Quiz evaluation completed: {percentage_score:.1f}% ({total_score:.1f}/{len(evaluations)})")
    return response

# Quiz Attempt Management
@app.post("/quiz/attempt/", response_model=QuizAttemptOut)
async def create_quiz_attempt(req: QuizAttemptCreateRequest):
    async with AsyncSessionLocal() as session:
        quiz_attempt = QuizAttemptORM(
            user_id=req.user_id,
            started_at=datetime.utcnow(),
            topic=req.topic,
            difficulty=req.difficulty,
            skill_type=req.skill_type,
            managerial_level=req.managerial_level,
            num_questions=req.num_questions
        )
        session.add(quiz_attempt)
        await session.commit()
        await session.refresh(quiz_attempt)
        return quiz_attempt

@app.get("/quiz/attempts/{user_id}", response_model=List[QuizAttemptOut])
async def get_quiz_attempts_for_user(user_id: str):
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            async_select(QuizAttemptORM).where(QuizAttemptORM.user_id == user_id).order_by(QuizAttemptORM.started_at.desc())
        )
        attempts = result.scalars().all()
        return attempts

# Fixed: This is the key endpoint that matches your old working code
@app.get("/quiz/attempt/{attempt_id}/evaluations", response_model=List[EvaluationResult])
async def get_attempt_evaluations(attempt_id: int):
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            async_select(EvaluationORM).where(EvaluationORM.quiz_attempt_id == attempt_id)
        )
        evals = result.scalars().all()
        
        out = []
        for e in evals:
            # Fetch question text (matches your old code structure)
            question_text = ""
            correct_answer = ""
            if e.question_id:
                qresult = await session.execute(async_select(QuestionORM).where(QuestionORM.id == e.question_id))
                q = qresult.scalars().first()
                if q:
                    question_text = q.question_text
                    correct_answer = q.answer
            
            out.append(EvaluationResult(
                question_id=e.question_id,
                question_text=question_text,
                user_answer=e.user_answer,
                correct_answer=correct_answer,
                score=e.score,
                feedback=e.feedback,
                is_correct=e.score >= 0.7,
                evaluation_method=e.evaluation_method
            ))
        return out

# Statistics Endpoints (matching your old working code structure)
@app.get("/stats/user/{user_id}")
async def get_user_stats(user_id: str):
    async with AsyncSessionLocal() as session:
        query = async_select(EvaluationORM).where(EvaluationORM.user_id == user_id)
        result = await session.execute(query)
        evaluations = result.scalars().all()
        
        if not evaluations:
            raise HTTPException(status_code=404, detail="No evaluations found for this user")
        
        total_questions = len(evaluations)
        total_score = sum(eval_item.score for eval_item in evaluations)
        average_score = total_score / total_questions
        
        mcq_evals = [e for e in evaluations if e.evaluation_method == "exact_match"]
        subjective_evals = [e for e in evaluations if e.evaluation_method in ["llm_evaluated", "keyword_match"]]
        
        mcq_correct = sum(1 for e in mcq_evals if e.score == 1.0)
        subjective_avg = sum(e.score for e in subjective_evals) / len(subjective_evals) if subjective_evals else 0
        
        recent_evals = sorted(evaluations, key=lambda x: x.created_at, reverse=True)[:10]
        recent_avg = sum(e.score for e in recent_evals) / len(recent_evals) if recent_evals else 0
        
        return {
            "user_id": user_id,
            "total_questions_attempted": total_questions,
            "overall_average_score": round(average_score, 3),
            "overall_percentage": round(average_score * 100, 1),
            "mcq_questions": len(mcq_evals),
            "mcq_correct": mcq_correct,
            "mcq_accuracy": round((mcq_correct / len(mcq_evals)) * 100, 1) if mcq_evals else 0,
            "subjective_questions": len(subjective_evals),
            "subjective_average_score": round(subjective_avg, 3),
            "subjective_percentage": round(subjective_avg * 100, 1),
            "recent_performance": round(recent_avg * 100, 1),
            "first_attempt": min(e.created_at for e in evaluations),
            "last_attempt": max(e.created_at for e in evaluations)
        }

# Managerial Ratios Endpoint
@app.get("/managerial_ratio/{managerial_level}")
async def get_managerial_ratio(managerial_level: str):
    ratios = await get_managerial_ratios(managerial_level)
    if ratios:
        return ratios
    raise HTTPException(status_code=404, detail="No ratio found for this managerial level")

# Health Check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.2.0",
        "features": [
            "question_generation", "quiz_evaluation", "user_statistics",
            "managerial_ratios", "quiz_attempt_tracking"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )
