import json
import re
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

def fix_common_json_issues(json_str: str) -> str:
    json_str = re.sub(r',\s*}', '}', json_str)
    json_str = re.sub(r',\s*]', ']', json_str)
    json_str = re.sub(r'}\s*{', '},{', json_str)
    json_str = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', json_str)
    return json_str

def clean_json_response(content: str) -> str:
    try:
        # Fixed: properly closed string literals
        content = re.sub(r'```,', '', content)
        content = re.sub(r'```', '', content)
        content = re.sub(r'^[^[{]*', '', content)
        content = re.sub(r'[^}\]]*$', '', content)
        
        start_idx = content.find('[')
        end_idx = content.rfind(']')
        
        if start_idx != -1 and end_idx != -1 and start_idx < end_idx:
            json_content = content[start_idx:end_idx + 1]
        else:
            start_idx = content.find('{')
            end_idx = content.rfind('}')
            if start_idx != -1 and end_idx != -1 and start_idx < end_idx:
                json_content = content[start_idx:end_idx + 1]
                if json_content.count('{') > 1:
                    objects = []
                    current_obj = ""
                    brace_count = 0
                    for char in json_content:
                        current_obj += char
                        if char == '{':
                            brace_count += 1
                        elif char == '}':
                            brace_count -= 1
                            if brace_count == 0:
                                try:
                                    json.loads(current_obj.strip())
                                    objects.append(current_obj.strip())
                                    current_obj = ""
                                except:
                                    current_obj = ""
                    if objects:
                        json_content = '[' + ','.join(objects) + ']'
                else:
                    json_content = '[' + json_content + ']'
            else:
                raise ValueError(f"No valid JSON structure found in response")
        
        json_content = fix_common_json_issues(json_content)
        
        try:
            json.loads(json_content)
            return json_content.strip()
        except json.JSONDecodeError as e:
            logger.error(f"JSON validation failed: {e}")
            logger.error(f"Problematic JSON: {json_content[:200]}...")
            raise ValueError(f"Invalid JSON after cleaning: {str(e)}")
    except Exception as e:
        logger.error(f"JSON cleaning failed: {e}")
        logger.error(f"Original content: {content[:200]}...")
        raise ValueError(f"Failed to clean JSON response: {str(e)}")

def clean_evaluation_json_response(content: str) -> str:
    # Fixed: properly closed string literals
    content = re.sub(r'```,', '', content)
    content = re.sub(r'```', '', content)
    start_idx = content.find('{')
    end_idx = content.rfind('}')
    
    if start_idx == -1 or end_idx == -1 or start_idx >= end_idx:
        raise ValueError(f"No valid JSON object found in response: {content[:200]}...")
    
    json_content = content[start_idx:end_idx + 1]
    json_content = re.sub(r',\s*}', '}', json_content)
    return json_content.strip()

def build_enhanced_prompt(
    topic: str,
    difficulty: str,
    skill_type: str,
    managerial_level: str,
    num_questions: int,
    question_type: str,
    avoid_questions: List[str] = None
) -> str:
    mcq_or_subj = "multiple choice questions" if question_type == "mcq" else "subjective questions"
    prompt = (
        f"Generate exactly {num_questions} unique {mcq_or_subj} about '{topic}' "
        f"at {difficulty} level for {skill_type.replace('_', ' ')} skills"
    )
    
    if managerial_level:
        prompt += f" for managerial level '{managerial_level}'"
    prompt += ".\n\n"
    
    if avoid_questions and avoid_questions:
        prompt += "AVOID these existing questions (create completely different ones):\n"
        for idx, q in enumerate(avoid_questions[:5]):
            prompt += f"{idx+1}. {q}\n"
        prompt += "\n"
    
    if question_type == "mcq":
        prompt += """CRITICAL: Return ONLY a valid JSON array. No explanations, no markdown, no extra text.

Format (EXACTLY like this):
[
  {
    "type": "mcq",
    "question": "Your question here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Option A"
  }
]

Requirements:
- Exactly 4 options for each question
- Answer must be exactly one of the options
- No trailing commas
- Double quotes only
- Each question must be unique and complete"""
    else:
        prompt += """CRITICAL: Return ONLY a valid JSON array. No explanations, no markdown, no extra text.

Format (EXACTLY like this):
[
  {
    "type": "subjective",
    "question": "Your detailed question here?",
    "answer": "Comprehensive model answer here"
  }
]

Requirements:
- Questions should require detailed answers
- Model answers should be comprehensive
- No trailing commas
- Double quotes only
- Each question must be unique"""
    
    return prompt

def build_evaluation_prompt(question: str, correct_answer: str, user_answer: str) -> str:
    return f"""
You are an expert evaluator. Evaluate the user's answer to the following question:

Question: {question}

Correct Answer: {correct_answer}

User's Answer: {user_answer}

Please evaluate the user's answer and provide:
1. A score between 0.0 and 1.0 (where 1.0 is perfect, 0.8-0.9 is very good, 0.6-0.7 is good, 0.4-0.5 is fair, 0.2-0.3 is poor, 0.0-0.1 is very poor)
2. Brief feedback explaining the score

Consider:
- Accuracy of key concepts
- Completeness of the answer  
- Understanding demonstrated
- Relevant details included

Return ONLY a JSON object in this exact format:
{{"score": 0.8, "feedback": "Your feedback here explaining the score and what was good/missing"}}

No explanations, just the JSON object.
"""
