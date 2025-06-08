DROP TABLE IF EXISTS evaluations CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS managerial_ratios CASCADE;

-- Questions table
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL UNIQUE,
    answer TEXT,
    type VARCHAR(20) NOT NULL,
    topic VARCHAR(100),
    difficulty VARCHAR(20),
    skill_type VARCHAR(20),
    managerial_level VARCHAR(50),
    options TEXT[],
    correct_option TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Managerial ratios table
CREATE TABLE managerial_ratios (
    managerial_level VARCHAR(32) PRIMARY KEY,
    soft_skill_ratio INTEGER NOT NULL CHECK (soft_skill_ratio >= 0 AND soft_skill_ratio <= 100),
    technical_ratio INTEGER NOT NULL CHECK (technical_ratio >= 0 AND technical_ratio <= 100)
);

-- Insert sample managerial level ratios
INSERT INTO managerial_ratios (managerial_level, soft_skill_ratio, technical_ratio) VALUES
('junior', 40, 60),
('manager', 50, 50),
('senior', 60, 40)
ON CONFLICT (managerial_level) DO UPDATE
SET soft_skill_ratio = EXCLUDED.soft_skill_ratio,
    technical_ratio = EXCLUDED.technical_ratio;

-- Quiz attempts table
CREATE TABLE quiz_attempts (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMP,
    topic VARCHAR(100),
    difficulty VARCHAR(20),
    skill_type VARCHAR(20),
    managerial_level VARCHAR(50),
    num_questions INTEGER,
    score FLOAT
);

-- Evaluations table (answers per attempt)
CREATE TABLE evaluations (
    id SERIAL PRIMARY KEY,
    quiz_attempt_id INTEGER REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    user_answer TEXT NOT NULL,
    score FLOAT NOT NULL,
    feedback TEXT,
    evaluation_method VARCHAR(20) NOT NULL,
    user_id VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);