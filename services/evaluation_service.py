import json
import logging
from typing import Tuple, Optional
from datetime import datetime
from sqlalchemy.future import select as async_select

from database import AsyncSessionLocal
from models import QuestionORM, EvaluationORM
from services.llm_service import call_groq_llm
from utils.helpers import build_evaluation_prompt, clean_evaluation_json_response

logger = logging.getLogger(__name__)

async def evaluate_mcq_answer(question: QuestionORM, user_answer: str) -> Tuple[float, str, str]:
    is_correct = user_answer.strip().lower() == question.correct_option.strip().lower()
    score = 1.0 if is_correct else 0.0
    feedback = "Correct answer!" if is_correct else f"Incorrect. The correct answer is: {question.correct_option}"
    return score, feedback, "exact_match"

async def evaluate_subjective_answer(question: QuestionORM, user_answer: str) -> Tuple[float, str, str]:
    try:
        prompt = build_evaluation_prompt(
            question.question_text,
            question.answer,
            user_answer
        )
        llm_response = await call_groq_llm(prompt)
        cleaned_response = clean_evaluation_json_response(llm_response)
        evaluation_data = json.loads(cleaned_response)
        
        score = float(evaluation_data.get("score", 0.0))
        feedback = evaluation_data.get("feedback", "No feedback provided")
        score = max(0.0, min(1.0, score))
        
        return score, feedback, "llm_evaluated"
    except Exception:
        # Fallback to keyword matching
        user_lower = user_answer.lower()
        correct_lower = question.answer.lower()
        user_words = set(user_lower.split())
        correct_words = set(correct_lower.split())
        
        if len(correct_words) > 0:
            overlap = len(user_words.intersection(correct_words))
            score = min(1.0, overlap / len(correct_words))
        else:
            score = 0.0
        
        feedback = f"Automated evaluation (LLM unavailable). Score based on keyword overlap with model answer."
        return score, feedback, "keyword_match"

async def save_evaluation_to_db(
    question_id: int, 
    user_answer: str, 
    score: float, 
    feedback: str, 
    evaluation_method: str,
    user_id: Optional[str] = None,
    quiz_attempt_id: Optional[int] = None
):
    async with AsyncSessionLocal() as session:
        evaluation = EvaluationORM(
            question_id=question_id,
            user_answer=user_answer,
            score=score,
            feedback=feedback,
            evaluation_method=evaluation_method,
            user_id=user_id,
            quiz_attempt_id=quiz_attempt_id,
            created_at=datetime.utcnow()
        )
        session.add(evaluation)
        await session.commit()
        await session.refresh(evaluation)
        return evaluation
