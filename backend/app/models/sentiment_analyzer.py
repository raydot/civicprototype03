"""
Political sentiment and intensity analysis for VoterPrime
Detects emotional intensity, urgency, and sentiment in political text
"""
import json
import time
import hashlib
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from functools import lru_cache
from openai import OpenAI

from ..config import settings
from ..utils.logging import structured_logger


@dataclass
class SentimentResult:
    """Sentiment analysis result for political text"""
    intensity: float  # 1-10 scale (1=mild interest, 10=urgent priority)
    emotion: str  # positive, negative, neutral
    urgency: str  # high, medium, low
    key_phrases: List[str]  # Emotional indicators found
    confidence: float  # 0-1 confidence in analysis
    processing_time_ms: int


class SentimentAnalyzer:
    """
    Political sentiment and intensity analysis using OpenAI
    Optimized for VoterPrime with caching, batching, and error handling
    """
    
    def __init__(self):
        self.client: Optional[OpenAI] = None
        self.cache: Dict[str, SentimentResult] = {}  # In-memory cache
        self.logger = structured_logger
        self._initialize_client()
        
        # Performance tracking
        self.cache_hits = 0
        self.api_calls = 0
    
    def _initialize_client(self) -> None:
        """Initialize OpenAI client"""
        try:
            if not settings.openai_api_key:
                raise ValueError("OpenAI API key not found")
            
            self.client = OpenAI(api_key=settings.openai_api_key)
            self.logger.info("Sentiment analyzer OpenAI client initialized")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize sentiment analyzer: {str(e)}")
            raise RuntimeError(f"Sentiment analyzer initialization failed: {str(e)}")
    
    @lru_cache(maxsize=1000)
    def _get_text_hash(self, text: str) -> str:
        """Generate hash for caching sentiment results"""
        return hashlib.md5(text.lower().strip().encode()).hexdigest()
    
    async def analyze_priority_intensity(self, text: str) -> SentimentResult:
        """
        Analyze political priority intensity and emotional urgency
        
        Examples:
        - "Healthcare is absolutely critical for families!" → intensity: 8, urgency: high
        - "We MUST act on climate change NOW" → intensity: 9, urgency: high  
        - "Education funding matters" → intensity: 6, urgency: medium
        - "I support some environmental policies" → intensity: 4, urgency: low
        """
        start_time = time.time()
        text_hash = self._get_text_hash(text)
        
        # Check cache first
        if text_hash in self.cache:
            self.cache_hits += 1
            cached_result = self.cache[text_hash]
            self.logger.info(f"Sentiment cache hit for: '{text[:30]}...'")
            return cached_result
        
        try:
            self.api_calls += 1
            self.logger.info(f"Analyzing sentiment for: '{text[:50]}...'")
            
            prompt = self._create_intensity_prompt(text)
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=300,
                response_format={"type": "json_object"}
            )
            
            result_data = json.loads(response.choices[0].message.content)
            processing_time = int((time.time() - start_time) * 1000)
            
            result = SentimentResult(
                intensity=float(result_data.get('intensity', 5.0)),
                emotion=result_data.get('emotion', 'neutral'),
                urgency=result_data.get('urgency', 'medium'),
                key_phrases=result_data.get('key_phrases', []),
                confidence=float(result_data.get('confidence', 0.5)),
                processing_time_ms=processing_time
            )
            
            # Cache the result
            self.cache[text_hash] = result
            
            self.logger.info(f"Sentiment analysis complete: intensity={result.intensity}, urgency={result.urgency}")
            
            return result
            
        except Exception as e:
            processing_time = int((time.time() - start_time) * 1000)
            self.logger.error(f"Sentiment analysis failed: {str(e)}")
            
            # Return neutral result on error
            fallback_result = SentimentResult(
                intensity=5.0,
                emotion='neutral',
                urgency='medium',
                key_phrases=[],
                confidence=0.0,
                processing_time_ms=processing_time
            )
            
            # Cache fallback to avoid repeated failures
            self.cache[text_hash] = fallback_result
            
            return fallback_result
    
    def _create_intensity_prompt(self, text: str) -> str:
        """Create optimized prompt for political intensity analysis"""
        return f"""
        Analyze the political priority intensity and emotional urgency in this voter statement:
        
        "{text}"
        
        Consider these intensity indicators:
        - URGENT language: "MUST", "NOW", "CRITICAL", "EMERGENCY"
        - Strong emotions: "absolutely", "desperately", "essential"
        - Personal stakes: "my family", "our future", "can't afford"
        - Action words: "fight for", "demand", "require"
        
        Return valid JSON with:
        {{
            "intensity": 1-10 (1=mild preference, 5=moderate concern, 8=strong priority, 10=urgent crisis),
            "emotion": "positive" | "negative" | "neutral",
            "urgency": "high" | "medium" | "low",
            "key_phrases": ["list", "of", "emotional", "indicators"],
            "confidence": 0.0-1.0
        }}
        
        Focus on political urgency and emotional investment, not general sentiment.
        """
    
    async def analyze_feedback_sentiment(self, feedback_text: str) -> SentimentResult:
        """
        Analyze user feedback to understand why they rejected recommendations
        
        Examples:
        - "This candidate doesn't share my values" → negative, specific mismatch
        - "Close, but not quite right" → neutral, needs refinement
        - "Completely wrong direction" → negative, strong rejection
        """
        start_time = time.time()
        text_hash = self._get_text_hash(f"feedback:{feedback_text}")
        
        # Check cache
        if text_hash in self.cache:
            self.cache_hits += 1
            return self.cache[text_hash]
        
        try:
            self.api_calls += 1
            self.logger.info(f"Analyzing feedback sentiment: '{feedback_text[:50]}...'")
            
            prompt = f"""
            Analyze why a voter rejected a political recommendation:
            
            "{feedback_text}"
            
            Return valid JSON with:
            {{
                "intensity": 1-10 (strength of rejection),
                "emotion": "positive" | "negative" | "neutral",
                "urgency": "high" | "medium" | "low" (how urgent the correction is),
                "key_phrases": ["specific", "rejection", "reasons"],
                "confidence": 0.0-1.0
            }}
            
            Focus on understanding what the voter wants instead.
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=300,
                response_format={"type": "json_object"}
            )
            
            result_data = json.loads(response.choices[0].message.content)
            processing_time = int((time.time() - start_time) * 1000)
            
            result = SentimentResult(
                intensity=float(result_data.get('intensity', 5.0)),
                emotion=result_data.get('emotion', 'neutral'),
                urgency=result_data.get('urgency', 'medium'),
                key_phrases=result_data.get('key_phrases', []),
                confidence=float(result_data.get('confidence', 0.5)),
                processing_time_ms=processing_time
            )
            
            # Cache result
            self.cache[text_hash] = result
            
            return result
            
        except Exception as e:
            processing_time = int((time.time() - start_time) * 1000)
            self.logger.error(f"Feedback sentiment analysis failed: {str(e)}")
            
            fallback_result = SentimentResult(
                intensity=5.0,
                emotion='neutral',
                urgency='medium',
                key_phrases=[],
                confidence=0.0,
                processing_time_ms=processing_time
            )
            
            self.cache[text_hash] = fallback_result
            return fallback_result
    
    async def batch_analyze(self, texts: List[str], analysis_type: str = "priority") -> List[SentimentResult]:
        """
        Efficiently analyze multiple texts using batch processing and caching
        
        Args:
            texts: List of texts to analyze
            analysis_type: "priority" or "feedback"
        """
        if not texts:
            return []
        
        self.logger.info(f"Batch analyzing {len(texts)} texts")
        
        # Separate cached and uncached texts
        cached_results = {}
        uncached_texts = []
        
        for text in texts:
            prefix = "feedback:" if analysis_type == "feedback" else ""
            text_hash = self._get_text_hash(f"{prefix}{text}")
            
            if text_hash in self.cache:
                cached_results[text] = self.cache[text_hash]
                self.cache_hits += 1
            else:
                uncached_texts.append(text)
        
        # Process uncached texts
        uncached_results = {}
        if uncached_texts:
            self.logger.info(f"Processing {len(uncached_texts)} uncached texts")
            
            # For now, process individually (could optimize with batch API calls)
            for text in uncached_texts:
                if analysis_type == "feedback":
                    result = await self.analyze_feedback_sentiment(text)
                else:
                    result = await self.analyze_priority_intensity(text)
                uncached_results[text] = result
        
        # Combine results in original order
        final_results = []
        for text in texts:
            if text in cached_results:
                final_results.append(cached_results[text])
            else:
                final_results.append(uncached_results[text])
        
        self.logger.info(f"Batch analysis complete: {self.cache_hits} cache hits, {len(uncached_texts)} API calls")
        
        return final_results
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get performance statistics"""
        total_requests = self.cache_hits + self.api_calls
        cache_hit_rate = self.cache_hits / total_requests if total_requests > 0 else 0
        
        return {
            "cache_size": len(self.cache),
            "cache_hits": self.cache_hits,
            "api_calls": self.api_calls,
            "cache_hit_rate": cache_hit_rate,
            "total_requests": total_requests
        }
    
    def clear_cache(self) -> None:
        """Clear the sentiment analysis cache"""
        self.cache.clear()
        self.cache_hits = 0
        self.api_calls = 0
        self.logger.info("Sentiment analysis cache cleared")
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get sentiment analyzer information"""
        return {
            "model_name": "gpt-3.5-turbo",
            "api_provider": "OpenAI",
            "cache_enabled": True,
            "cache_stats": self.get_cache_stats(),
            "supported_analysis_types": ["priority_intensity", "feedback_sentiment"],
            "status": "ready" if self.client is not None else "not_initialized"
        }


# Global sentiment analyzer instance (singleton pattern)
_sentiment_analyzer_instance: Optional[SentimentAnalyzer] = None


def get_sentiment_analyzer() -> SentimentAnalyzer:
    """
    Get or create the global sentiment analyzer instance
    
    Returns:
        SentimentAnalyzer instance
    """
    global _sentiment_analyzer_instance
    
    if _sentiment_analyzer_instance is None:
        _sentiment_analyzer_instance = SentimentAnalyzer()
    
    return _sentiment_analyzer_instance
