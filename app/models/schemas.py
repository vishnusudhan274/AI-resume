from pydantic import BaseModel, Field
from typing import Optional


class AnalyzeTextRequest(BaseModel):
    resume_text: str = Field(..., min_length=50, description="Raw resume text")
    job_description: str = Field(..., min_length=30, description="Job description text")


class StrengthBreakdown(BaseModel):
    experience: str
    education: str
    keywords: str
    formatting: str


class AnalysisResult(BaseModel):
    match_score: int = Field(..., ge=0, le=100)
    verdict: str
    summary: str
    matched_skills: list[str]
    missing_skills: list[str]
    suggestions: list[str]
    strengths: StrengthBreakdown
    cosine_similarity: Optional[float] = Field(None, description="Raw BERT cosine similarity score")


class HealthResponse(BaseModel):
    status: str
    version: str
