import json
import logging
from typing import List, Optional
from fastapi import HTTPException
from sqlalchemy.future import select as async_select
from datetime import datetime

from database import AsyncSessionLocal
from models import QuestionORM, ManagerialRatioORM
from schemas import (
    MCQQuestionCreate, SubjectiveQuestionCreate, QuestionBatchRequest,
    QuestionForEvaluation, QuizRequest
)
from services.llm_service import call_groq_llm
from utils.helpers import (
    clean_json_response, build_enhanced_prompt
)

logger = logging.getLogger(__name__)

async def get_recent_question_texts(topic: str, skill_type: str, managerial_level: Optional[str], n: int = 10) -> List[str]:
    query = async_select(QuestionORM).where(
        QuestionORM.topic == topic,
        QuestionORM.skill_type == skill_type
    )
    if managerial_level:
        query = query.where(QuestionORM.managerial_level == managerial_level)
    query = query.order_by(QuestionORM.created_at.desc()).limit(n)
    
    async with AsyncSessionLocal() as session:
        result = await session.execute(query)
        return [q.question_text for q in result.scalars().all()]

async def get_managerial_ratios(managerial_level: str) -> Optional[dict]:
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            async_select(ManagerialRatioORM).where(ManagerialRatioORM.managerial_level == managerial_level)
        )
        ratio = result.scalars().first()
        if ratio:
            return {"soft_skill_ratio": ratio.soft_skill_ratio, "technical_ratio": ratio.technical_ratio}
        return None

async def validate_and_retry_llm_call(
    prompt: str, 
    max_retries: int = 3,
    question_type: str = "mcq"
) -> List[dict]:
    for attempt in range(max_retries):
        try:
            logger.info(f"LLM call attempt {attempt + 1}/{max_retries}")
            if attempt > 0:
                retry_prompt = prompt + f"\n\nIMPORTANT: Return ONLY valid JSON. Attempt {attempt + 1}."
                if attempt == 2:
                    retry_prompt += "\nNo explanations, no markdown, just clean JSON array."
            else:
                retry_prompt = prompt
            
            content = await call_groq_llm(retry_prompt)
            logger.info(f"LLM response preview: {content[:100]}...")
            cleaned = clean_json_response(content)
            batch = json.loads(cleaned)
            
            if not isinstance(batch, list):
                raise ValueError("Response is not a JSON array")
            if len(batch) == 0:
                raise ValueError("Empty response array")
            
            logger.info(f"Successfully parsed {len(batch)} items from LLM response")
            return batch
        except Exception as e:
            logger.warning(f"Attempt {attempt + 1} failed: {str(e)}")
            if attempt == max_retries - 1:
                raise HTTPException(
                    status_code=500, 
                    detail=f"Failed to get valid response from LLM after {max_retries} attempts. Last error: {str(e)}"
                )
            continue

def validate_mcq_batch(batch: List[dict]) -> List[MCQQuestionCreate]:
    valid = []
    seen = set()
    for q in batch:
        try:
            text = q.get("question", "").strip()
            if not text or len(text) < 8 or text in seen:
                continue
            seen.add(text)
            
            options = q.get("options", [])
            answer = str(q.get("answer", "")).strip()
            
            if not isinstance(options, list) or len(options) != 4 or answer not in options:
                continue
            
            valid.append(MCQQuestionCreate(
                question_text=text,
                answer=answer,
                type="mcq",
                options=options,
                correct_option=answer
            ))
        except Exception:
            continue
    return valid

def validate_subjective_batch(batch: List[dict]) -> List[SubjectiveQuestionCreate]:
    valid = []
    seen = set()
    for q in batch:
        try:
            text = q.get("question", "").strip()
            answer = q.get("answer", "").strip()
            
            if not text or not answer or len(text) < 8 or text in seen:
                continue
            seen.add(text)
            
            valid.append(SubjectiveQuestionCreate(
                question_text=text,
                answer=answer,
                type="subjective"
            ))
        except Exception:
            continue
    return valid

async def save_mcq_questions_to_db(questions: List[MCQQuestionCreate], meta: QuestionBatchRequest):
    async with AsyncSessionLocal() as session:
        created = []
        for q in questions:
            res = await session.execute(
                async_select(QuestionORM).where(QuestionORM.question_text == q.question_text)
            )
            if res.scalars().first():
                continue
            
            db_q = QuestionORM(
                question_text=q.question_text,
                answer=q.answer,
                type="mcq",
                topic=meta.topic,
                difficulty=meta.difficulty.value,
                skill_type=meta.skill_type.value,
                managerial_level=meta.managerial_level,
                options=q.options,
                correct_option=q.correct_option,
                created_at=datetime.utcnow()
            )
            session.add(db_q)
            created.append(db_q)
        
        await session.commit()
        for q in created:
            await session.refresh(q)
        return created

async def save_subjective_questions_to_db(questions: List[SubjectiveQuestionCreate], meta: QuestionBatchRequest):
    async with AsyncSessionLocal() as session:
        created = []
        for q in questions:
            res = await session.execute(
                async_select(QuestionORM).where(QuestionORM.question_text == q.question_text)
            )
            if res.scalars().first():
                continue
            
            db_q = QuestionORM(
                question_text=q.question_text,
                answer=q.answer,
                type="subjective",
                topic=meta.topic,
                difficulty=meta.difficulty.value,
                skill_type=meta.skill_type.value,
                managerial_level=meta.managerial_level,
                options=None,
                correct_option=None,
                created_at=datetime.utcnow()
            )
            session.add(db_q)
            created.append(db_q)
        
        await session.commit()
        for q in created:
            await session.refresh(q)
        return created

async def get_quiz_questions(request: QuizRequest) -> List[QuestionForEvaluation]:
    logger.info(f"Starting quiz with {request.num_questions} questions")
    
    if request.managerial_level:
        ratios = await get_managerial_ratios(request.managerial_level)
        if ratios:
            soft_skill_ratio = ratios['soft_skill_ratio']
            technical_ratio = ratios['technical_ratio']
            num_soft = int(round(request.num_questions * soft_skill_ratio / 100))
            num_tech = request.num_questions - num_soft
            
            async with AsyncSessionLocal() as session:
                # Get soft skill questions
                query_soft = async_select(QuestionORM).where(QuestionORM.skill_type == "soft_skill")
                if request.topic:
                    query_soft = query_soft.where(QuestionORM.topic == request.topic)
                if request.difficulty:
                    query_soft = query_soft.where(QuestionORM.difficulty == request.difficulty.value)
                if request.question_type:
                    query_soft = query_soft.where(QuestionORM.type == request.question_type.value)
                query_soft = query_soft.order_by(QuestionORM.created_at.desc()).limit(num_soft)
                result_soft = await session.execute(query_soft)
                soft_questions = result_soft.scalars().all()

                # Get technical questions
                query_tech = async_select(QuestionORM).where(QuestionORM.skill_type == "technical")
                if request.topic:
                    query_tech = query_tech.where(QuestionORM.topic == request.topic)
                if request.difficulty:
                    query_tech = query_tech.where(QuestionORM.difficulty == request.difficulty.value)
                if request.question_type:
                    query_tech = query_tech.where(QuestionORM.type == request.question_type.value)
                query_tech = query_tech.order_by(QuestionORM.created_at.desc()).limit(num_tech)
                result_tech = await session.execute(query_tech)
                tech_questions = result_tech.scalars().all()

                questions = list(soft_questions) + list(tech_questions)
                if not questions:
                    raise HTTPException(status_code=404, detail="No questions found matching the criteria")
                
                return [QuestionForEvaluation(
                    id=q.id,
                    question_text=q.question_text,
                    type=q.type,
                    topic=q.topic,
                    difficulty=q.difficulty,
                    skill_type=q.skill_type,
                    managerial_level=q.managerial_level,
                    options=q.options if q.type == "mcq" else None
                ) for q in questions]
    
    # Regular query without managerial ratios
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
    
    query = query.order_by(QuestionORM.created_at.desc()).limit(request.num_questions)
    
    async with AsyncSessionLocal() as session:
        result = await session.execute(query)
        questions = result.scalars().all()
        
        if not questions:
            raise HTTPException(status_code=404, detail="No questions found matching the criteria")
        
        return [QuestionForEvaluation(
            id=q.id,
            question_text=q.question_text,
            type=q.type,
            topic=q.topic,
            difficulty=q.difficulty,
            skill_type=q.skill_type,
            managerial_level=q.managerial_level,
            options=q.options if q.type == "mcq" else None
        ) for q in questions]
