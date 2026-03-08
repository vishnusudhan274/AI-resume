import logging

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.models.schemas import AnalysisResult, AnalyzeTextRequest
from app.services.extractor import extract_text
from app.services.similarity import compute_similarity
from app.services.llm_analyzer import analyze_resume

logger = logging.getLogger(__name__)

router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


# ─── Route 1: Upload file + paste JD ──────────────────────────────────────────

@router.post(
    "/analyze/upload",
    response_model=AnalysisResult,
    summary="Upload resume file + job description",
    description="Upload a PDF/DOCX/TXT resume and provide a job description. Returns full AI analysis.",
)
async def analyze_upload(
    resume: UploadFile = File(..., description="Resume file (PDF, DOCX, or TXT)"),
    job_description: str = Form(..., min_length=30, description="Job description text"),
):
    # Validate file size
    contents = await resume.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Max size is 10 MB.")

    # Reset file pointer after reading for size check
    import io
    resume.file = io.BytesIO(contents)

    try:
        resume_text = await extract_text(resume)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Extraction error: {e}")
        raise HTTPException(status_code=422, detail=str(e))

    return await _run_analysis(resume_text, job_description)


# ─── Route 2: Raw text (both paste) ───────────────────────────────────────────

@router.post(
    "/analyze/text",
    response_model=AnalysisResult,
    summary="Analyze resume text + job description",
    description="Provide both resume text and job description as plain text. Returns full AI analysis.",
)
async def analyze_text(body: AnalyzeTextRequest):
    return await _run_analysis(body.resume_text, body.job_description)


# ─── Shared analysis pipeline ─────────────────────────────────────────────────

async def _run_analysis(resume_text: str, job_description: str) -> AnalysisResult:
    if len(resume_text.strip()) < 50:
        raise HTTPException(status_code=422, detail="Resume text too short (min 50 characters).")
    if len(job_description.strip()) < 30:
        raise HTTPException(status_code=422, detail="Job description too short (min 30 characters).")

    logger.info(f"Running analysis: resume={len(resume_text)} chars, jd={len(job_description)} chars")

    try:
        # Step 1: BERT + FAISS cosine similarity
        similarity = compute_similarity(resume_text, job_description)
        logger.info(f"Cosine similarity: {similarity:.4f}")
    except Exception as e:
        logger.error(f"Similarity computation failed: {e}")
        similarity = 0.5  # fallback

    try:
        # Step 2: LLM deep analysis (calibrated with similarity)
        result = analyze_resume(resume_text, job_description, similarity)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=f"LLM analysis error: {str(e)}")
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected LLM error: {e}")
        raise HTTPException(status_code=500, detail="Analysis failed unexpectedly.")

    return result
