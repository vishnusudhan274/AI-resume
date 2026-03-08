"""
LLM Analysis Service
Uses Anthropic Claude to perform deep resume analysis:
- Skill matching & gap detection
- ATS scoring calibrated with BERT cosine similarity
- Actionable improvement suggestions
"""

import json
import logging
import os
import re

import anthropic

from app.models.schemas import AnalysisResult, StrengthBreakdown

logger = logging.getLogger(__name__)

_client: anthropic.Anthropic | None = None


def _get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise RuntimeError("ANTHROPIC_API_KEY environment variable not set.")
        _client = anthropic.Anthropic(api_key=api_key)
    return _client


def analyze_resume(
    resume_text: str,
    job_description: str,
    cosine_similarity: float,
) -> AnalysisResult:
    """
    Send resume + JD to Claude for structured analysis.
    Cosine similarity is injected into the prompt so the LLM calibrates
    its match_score to align with the semantic similarity signal.
    """
    similarity_pct = round(cosine_similarity * 100, 1)

    prompt = f"""You are a senior ATS (Applicant Tracking System) expert and career coach.

The semantic (BERT cosine) similarity between the resume and job description is {similarity_pct}%.
Use this as a calibration signal — your match_score should be close to this value, 
adjusted ±15 points based on keyword specificity, experience depth, and skill gaps.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Respond ONLY with a valid JSON object. No markdown, no backticks, no commentary.

{{
  "match_score": <integer 0-100>,
  "verdict": "<STRONG MATCH | GOOD MATCH | PARTIAL MATCH | WEAK MATCH>",
  "summary": "<2-3 sentence overall assessment mentioning the role>",
  "matched_skills": ["skill1", "skill2", ...],
  "missing_skills": ["skill1", "skill2", ...],
  "suggestions": [
    "Concrete improvement suggestion 1",
    "Concrete improvement suggestion 2",
    "Concrete improvement suggestion 3",
    "Concrete improvement suggestion 4",
    "Concrete improvement suggestion 5"
  ],
  "strengths": {{
    "experience": "<short assessment>",
    "education": "<short assessment>",
    "keywords": "<short assessment>",
    "formatting": "<short assessment>"
  }}
}}"""

    client = _get_client()
    logger.info("Sending resume analysis request to Claude...")

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = message.content[0].text.strip()
    logger.info(f"Claude response received ({len(raw)} chars)")

    # Strip accidental markdown fences
    raw = re.sub(r"```json|```", "", raw).strip()

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Claude JSON: {e}\nRaw: {raw[:500]}")
        raise ValueError(f"LLM returned invalid JSON: {e}")

    return AnalysisResult(
        match_score=int(data.get("match_score", 50)),
        verdict=data.get("verdict", "ANALYZED"),
        summary=data.get("summary", ""),
        matched_skills=data.get("matched_skills", []),
        missing_skills=data.get("missing_skills", []),
        suggestions=data.get("suggestions", []),
        strengths=StrengthBreakdown(**data.get("strengths", {
            "experience": "N/A", "education": "N/A",
            "keywords": "N/A", "formatting": "N/A"
        })),
        cosine_similarity=round(cosine_similarity, 4),
    )
