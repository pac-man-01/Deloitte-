import os
import httpx
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "llama3-70b-8192"

async def call_groq_llm(prompt: str) -> str:
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7,
        "max_tokens": 1800,
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post("https://api.groq.com/openai/v1/chat/completions", json=payload, headers=headers)
    
    if resp.status_code != 200:
        raise HTTPException(status_code=500, detail=f"GROQ API error: {resp.text}")
    
    data = resp.json()
    content = data["choices"][0]["message"]["content"]
    return content
