"""
Sentiment analysis API routes for VoterPrime political text analysis
"""
from fastapi import APIRouter, HTTPException
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import time

from ...models.sentiment_analyzer import get_sentiment_analyzer, SentimentResult
from ...utils.logging import structured_logger

router = APIRouter(prefix="/sentiment-analysis", tags=["Sentiment Analysis"])
logger = structured_logger


# Request/Response Models
class SentimentAnalysisRequest(BaseModel):
    """Request model for sentiment analysis"""
    text: str = Field(..., description="Political text to analyze for sentiment and intensity")
    analysis_type: str = Field(
        "priority", 
        description="Type of analysis: 'priority' for priority intensity, 'feedback' for rejection analysis"
    )


class SentimentAnalysisResponse(BaseModel):
    """Individual sentiment analysis response"""
    text: str
    intensity: float
    emotion: str
    urgency: str
    key_phrases: List[str]
    confidence: float
    processing_time_ms: int
    analysis_type: str


class BatchSentimentRequest(BaseModel):
    """Request model for batch sentiment analysis"""
    texts: List[str] = Field(..., description="List of political texts to analyze")
    analysis_type: str = Field("priority", description="Type of analysis to perform")


class BatchSentimentResponse(BaseModel):
    """Batch sentiment analysis response"""
    results: List[SentimentAnalysisResponse]
    total_texts: int
    total_processing_time_ms: int
    cache_stats: Dict[str, Any]


@router.post("/analyze", response_model=SentimentAnalysisResponse)
async def analyze_sentiment(request: SentimentAnalysisRequest):
    """
    Analyze political sentiment and intensity of text
    
    Examples:
    - Priority: "Healthcare is absolutely critical for our families!"
    - Feedback: "This candidate doesn't represent my values"
    """
    start_time = time.time()
    
    try:
        logger.info(f"Sentiment analysis request: '{request.text[:50]}...'")
        
        sentiment_analyzer = get_sentiment_analyzer()
        
        # Choose analysis method based on type
        if request.analysis_type == "feedback":
            result = await sentiment_analyzer.analyze_feedback_sentiment(request.text)
        else:
            result = await sentiment_analyzer.analyze_priority_intensity(request.text)
        
        response = SentimentAnalysisResponse(
            text=request.text,
            intensity=result.intensity,
            emotion=result.emotion,
            urgency=result.urgency,
            key_phrases=result.key_phrases,
            confidence=result.confidence,
            processing_time_ms=result.processing_time_ms,
            analysis_type=request.analysis_type
        )
        
        logger.info(f"Sentiment analysis complete: intensity={result.intensity}, urgency={result.urgency}")
        
        return response
        
    except Exception as e:
        logger.error(f"Sentiment analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Sentiment analysis failed: {str(e)}")


@router.post("/batch-analyze", response_model=BatchSentimentResponse)
async def batch_analyze_sentiment(request: BatchSentimentRequest):
    """
    Analyze sentiment for multiple texts efficiently using caching and batch processing
    
    Useful for analyzing multiple voter statements or feedback at once
    """
    start_time = time.time()
    
    try:
        logger.info(f"Batch sentiment analysis: {len(request.texts)} texts")
        
        sentiment_analyzer = get_sentiment_analyzer()
        
        # Perform batch analysis
        results = await sentiment_analyzer.batch_analyze(request.texts, request.analysis_type)
        
        # Convert to response format
        response_results = []
        for i, result in enumerate(results):
            response_results.append(SentimentAnalysisResponse(
                text=request.texts[i],
                intensity=result.intensity,
                emotion=result.emotion,
                urgency=result.urgency,
                key_phrases=result.key_phrases,
                confidence=result.confidence,
                processing_time_ms=result.processing_time_ms,
                analysis_type=request.analysis_type
            ))
        
        total_processing_time = int((time.time() - start_time) * 1000)
        
        response = BatchSentimentResponse(
            results=response_results,
            total_texts=len(request.texts),
            total_processing_time_ms=total_processing_time,
            cache_stats=sentiment_analyzer.get_cache_stats()
        )
        
        logger.info(f"Batch sentiment analysis complete: {len(results)} results in {total_processing_time}ms")
        
        return response
        
    except Exception as e:
        logger.error(f"Batch sentiment analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Batch sentiment analysis failed: {str(e)}")


@router.get("/model-info")
async def get_sentiment_model_info():
    """Get information about the sentiment analysis model and performance"""
    try:
        sentiment_analyzer = get_sentiment_analyzer()
        return sentiment_analyzer.get_model_info()
        
    except Exception as e:
        logger.error(f"Failed to get sentiment model info: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get model info: {str(e)}")


@router.get("/cache-stats")
async def get_cache_stats():
    """Get sentiment analysis cache performance statistics"""
    try:
        sentiment_analyzer = get_sentiment_analyzer()
        return sentiment_analyzer.get_cache_stats()
        
    except Exception as e:
        logger.error(f"Failed to get cache stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get cache stats: {str(e)}")


@router.post("/clear-cache")
async def clear_sentiment_cache():
    """Clear the sentiment analysis cache (useful for testing)"""
    try:
        sentiment_analyzer = get_sentiment_analyzer()
        sentiment_analyzer.clear_cache()
        
        return {"message": "Sentiment analysis cache cleared successfully"}
        
    except Exception as e:
        logger.error(f"Failed to clear cache: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to clear cache: {str(e)}")


@router.get("/examples")
async def get_example_texts():
    """Get example political texts for testing sentiment analysis"""
    return {
        "priority_examples": [
            {
                "text": "Healthcare is absolutely critical for our families!",
                "expected": {"intensity": 8, "urgency": "high", "emotion": "positive"}
            },
            {
                "text": "We MUST act on climate change NOW before it's too late",
                "expected": {"intensity": 9, "urgency": "high", "emotion": "negative"}
            },
            {
                "text": "Education funding matters for our children's future",
                "expected": {"intensity": 6, "urgency": "medium", "emotion": "positive"}
            },
            {
                "text": "I support some environmental policies",
                "expected": {"intensity": 4, "urgency": "low", "emotion": "neutral"}
            },
            {
                "text": "Our democracy is under attack and we need to fight back!",
                "expected": {"intensity": 9, "urgency": "high", "emotion": "negative"}
            }
        ],
        "feedback_examples": [
            {
                "text": "This candidate doesn't share my values at all",
                "expected": {"intensity": 8, "urgency": "medium", "emotion": "negative"}
            },
            {
                "text": "Close, but not quite what I'm looking for",
                "expected": {"intensity": 4, "urgency": "low", "emotion": "neutral"}
            },
            {
                "text": "Completely wrong direction for our country",
                "expected": {"intensity": 9, "urgency": "high", "emotion": "negative"}
            },
            {
                "text": "Pretty good match, just need some adjustments",
                "expected": {"intensity": 3, "urgency": "low", "emotion": "positive"}
            }
        ]
    }
