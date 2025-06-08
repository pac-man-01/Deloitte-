from sqlalchemy import Column, Integer, String, Text, ARRAY, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class QuestionORM(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    question_text = Column(Text, nullable=False, unique=True)
    answer = Column(Text, nullable=True)
    type = Column(String(20), nullable=False)
    topic = Column(String(100), nullable=True)
    difficulty = Column(String(20), nullable=True)
    skill_type = Column(String(20), nullable=True)
    managerial_level = Column(String(50), nullable=True)
    options = Column(ARRAY(Text), nullable=True)
    correct_option = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    evaluations = relationship("EvaluationORM", back_populates="question")

class QuizAttemptORM(Base):
    __tablename__ = "quiz_attempts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False)
    started_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    topic = Column(String(100), nullable=True)
    difficulty = Column(String(20), nullable=True)
    skill_type = Column(String(20), nullable=True)
    managerial_level = Column(String(50), nullable=True)
    num_questions = Column(Integer, nullable=True)
    score = Column(Float, nullable=True)
    evaluations = relationship("EvaluationORM", back_populates="quiz_attempt")

class EvaluationORM(Base):
    __tablename__ = "evaluations"
    id = Column(Integer, primary_key=True, index=True)
    quiz_attempt_id = Column(Integer, ForeignKey("quiz_attempts.id"), nullable=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    user_answer = Column(Text, nullable=False)
    score = Column(Float, nullable=False)
    feedback = Column(Text, nullable=True)
    evaluation_method = Column(String(20), nullable=False)
    user_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    question = relationship("QuestionORM", back_populates="evaluations")
    quiz_attempt = relationship("QuizAttemptORM", back_populates="evaluations")

class ManagerialRatioORM(Base):
    __tablename__ = "managerial_ratios"
    managerial_level = Column(String(32), primary_key=True)
    soft_skill_ratio = Column(Integer, nullable=False)
    technical_ratio = Column(Integer, nullable=False)
