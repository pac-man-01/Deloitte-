from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from enum import Enum
from datetime import datetime

class DifficultyLevel(str, Enum):
    novice = "novice"
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"

class SkillType(str, Enum):
    technical = "technical"
    soft_skill = "soft_skill"

class QuestionType(str, Enum):
    mcq = "mcq"
    subjective = "subjective"

class QuestionBatchRequest(BaseModel):
    topic: str
    difficulty: DifficultyLevel
    skill_type: SkillType
    managerial_level: Optional[str] = None
    num_questions: int = 5
    question_type: QuestionType = QuestionType.mcq

class MCQQuestionCreate(BaseModel):
    question_text: str
    answer: str
    type: str = "mcq"
    topic: Optional[str] = None
    difficulty: Optional[str] = None
    skill_type: Optional[str] = None
    managerial_level: Optional[str] = None
    options: List[str]
    correct_option: str

class SubjectiveQuestionCreate(BaseModel):
    question_text: str
    answer: str
    type: str = "subjective"
    topic: Optional[str] = None
    difficulty: Optional[str] = None
    skill_type: Optional[str] = None
    managerial_level: Optional[str] = None

class QuestionOut(BaseModel):
    id: int
    question_text: str
    answer: Optional[str]
    type: str
    topic: Optional[str]
    difficulty: Optional[str]
    skill_type: Optional[str]
    managerial_level: Optional[str]
    options: Optional[List[str]]
    correct_option: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class QuestionForEvaluation(BaseModel):
    id: int
    question_text: str
    type: str
    topic: Optional[str]
    difficulty: Optional[str]
    skill_type: Optional[str]
    managerial_level: Optional[str]
    options: Optional[List[str]]
    
    class Config:
        from_attributes = True

class UserAnswer(BaseModel):
    question_id: int
    user_answer: str
    user_id: Optional[str] = None

class EvaluationResult(BaseModel):
    question_id: int
    question_text: str
    user_answer: str
    correct_answer: str
    score: float
    feedback: Optional[str]
    is_correct: bool
    evaluation_method: str

class QuizEvaluationRequest(BaseModel):
    answers: List[UserAnswer]
    quiz_attempt_id: Optional[int] = None

class QuizEvaluationResponse(BaseModel):
    total_questions: int
    total_score: float
    percentage_score: float
    evaluations: List[EvaluationResult]
    quiz_attempt_id: Optional[int] = None

class QuizRequest(BaseModel):
    topic: Optional[str] = None
    difficulty: Optional[DifficultyLevel] = None
    skill_type: Optional[SkillType] = None
    managerial_level: Optional[str] = None
    question_type: Optional[QuestionType] = None
    num_questions: int = 5
    user_id: Optional[str] = None

class QuizAttemptCreateRequest(BaseModel):
    user_id: str
    topic: Optional[str] = None
    difficulty: Optional[str] = None
    skill_type: Optional[str] = None
    managerial_level: Optional[str] = None
    num_questions: Optional[int] = None

class QuizAttemptOut(BaseModel):
    id: int
    user_id: str
    started_at: datetime
    ended_at: Optional[datetime]
    topic: Optional[str]
    difficulty: Optional[str]
    skill_type: Optional[str]
    managerial_level: Optional[str]
    num_questions: Optional[int]
    score: Optional[float]

    class Config:
        orm_mode = True
