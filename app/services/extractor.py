import io
import logging
from fastapi import UploadFile, HTTPException

logger = logging.getLogger(__name__)


async def extract_text(file: UploadFile) -> str:
    """
    Extract plain text from an uploaded resume file.
    Supports: PDF, DOCX, TXT
    """
    filename = file.filename or ""
    content = await file.read()

    if filename.lower().endswith(".pdf"):
        return _extract_from_pdf(content, filename)
    elif filename.lower().endswith(".docx"):
        return _extract_from_docx(content, filename)
    elif filename.lower().endswith(".txt"):
        return content.decode("utf-8", errors="ignore").strip()
    else:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: '{filename}'. Use PDF, DOCX, or TXT.",
        )


def _extract_from_pdf(content: bytes, filename: str) -> str:
    try:
        import pdfplumber

        text_parts = []
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    text_parts.append(text.strip())

        result = "\n\n".join(text_parts).strip()
        if not result:
            raise ValueError("No extractable text found in PDF.")
        logger.info(f"Extracted {len(result)} chars from PDF: {filename}")
        return result

    except ImportError:
        raise HTTPException(status_code=500, detail="pdfplumber not installed. Run: pip install pdfplumber")
    except Exception as e:
        logger.error(f"PDF extraction failed for {filename}: {e}")
        raise HTTPException(status_code=422, detail=f"Could not extract text from PDF: {str(e)}")


def _extract_from_docx(content: bytes, filename: str) -> str:
    try:
        from docx import Document

        doc = Document(io.BytesIO(content))
        paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
        result = "\n".join(paragraphs)

        if not result:
            raise ValueError("No text found in DOCX.")
        logger.info(f"Extracted {len(result)} chars from DOCX: {filename}")
        return result

    except ImportError:
        raise HTTPException(status_code=500, detail="python-docx not installed. Run: pip install python-docx")
    except Exception as e:
        logger.error(f"DOCX extraction failed for {filename}: {e}")
        raise HTTPException(status_code=422, detail=f"Could not extract text from DOCX: {str(e)}")
