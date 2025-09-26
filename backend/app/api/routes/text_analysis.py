"""
Text analysis API endpoints
"""
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
import time
from ...models.text_encoder import get_text_encoder, TextEncoder
from ...utils.logging import structured_logger


router = APIRouter(prefix="/text-analysis", tags=["text-analysis"])


class TextEncodeRequest(BaseModel):
    """Request model for text encoding"""
    text: str = Field(..., min_length=1, max_length=1000, description="Text to encode")


class TextEncodeResponse(BaseModel):
    """Response model for text encoding"""
    text: str
    embeddings: List[float]
    vector_dimension: int
    processing_time_ms: int
    model_name: str


class SimilarityRequest(BaseModel):
    """Request model for similarity calculation"""
    query_text: str = Field(..., min_length=1, max_length=1000, description="Query text")
    candidate_texts: List[str] = Field(..., min_items=1, max_items=20, description="Texts to compare against")
    top_k: int = Field(5, ge=1, le=10, description="Number of top matches to return")


class SimilarityMatch(BaseModel):
    """Single similarity match"""
    text: str
    similarity: float = Field(..., ge=0.0, le=1.0)
    confidence: int = Field(..., ge=0, le=100, description="Confidence as percentage")


class SimilarityResponse(BaseModel):
    """Response model for similarity search"""
    query_text: str
    matches: List[SimilarityMatch]
    processing_time_ms: int
    model_name: str


@router.post("/encode", response_model=TextEncodeResponse)
async def encode_text(
    request: TextEncodeRequest,
    text_encoder: TextEncoder = Depends(get_text_encoder)
):
    """
    Encode text to embeddings
    """
    start_time = time.time()
    
    try:
        structured_logger.info(f"Encoding text: '{request.text[:50]}...'")
        
        # Encode the text
        embeddings = text_encoder.encode_text(request.text)
        
        # Get model info
        model_info = text_encoder.get_model_info()
        
        processing_time = int((time.time() - start_time) * 1000)
        
        structured_logger.info(f"Text encoded successfully in {processing_time}ms")
        
        return TextEncodeResponse(
            text=request.text,
            embeddings=embeddings.tolist(),
            vector_dimension=len(embeddings),
            processing_time_ms=processing_time,
            model_name=model_info['model_name']
        )
    
    except ValueError as e:
        structured_logger.error(f"Invalid input for text encoding: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    
    except Exception as e:
        structured_logger.error(f"Text encoding failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Text encoding failed")


@router.post("/similarity", response_model=SimilarityResponse)
async def find_similar_texts(
    request: SimilarityRequest,
    text_encoder: TextEncoder = Depends(get_text_encoder)
):
    """
    Find texts most similar to a query
    """
    start_time = time.time()
    
    try:
        structured_logger.info(f"Finding similar texts for: '{request.query_text[:50]}...'")
        
        # Find similar texts
        similar_texts = text_encoder.find_most_similar(
            query_text=request.query_text,
            candidate_texts=request.candidate_texts,
            top_k=request.top_k
        )
        
        # Convert to response format
        matches = []
        for match in similar_texts:
            confidence = int(match['similarity'] * 100)  # Convert to percentage
            matches.append(SimilarityMatch(
                text=match['text'],
                similarity=match['similarity'],
                confidence=confidence
            ))
        
        processing_time = int((time.time() - start_time) * 1000)
        model_info = text_encoder.get_model_info()
        
        structured_logger.info(f"Found {len(matches)} similar texts in {processing_time}ms")
        
        return SimilarityResponse(
            query_text=request.query_text,
            matches=matches,
            processing_time_ms=processing_time,
            model_name=model_info['model_name']
        )
    
    except ValueError as e:
        structured_logger.error(f"Invalid input for similarity search: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    
    except Exception as e:
        structured_logger.error(f"Similarity search failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Similarity search failed")


@router.get("/model-info")
async def get_model_info(
    text_encoder: TextEncoder = Depends(get_text_encoder)
):
    """
    Get information about the text encoder model
    """
    try:
        model_info = text_encoder.get_model_info()
        return {
            "status": "success",
            "model": model_info
        }
    
    except Exception as e:
        structured_logger.error(f"Failed to get model info: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get model information")
