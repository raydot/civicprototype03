"""
Utility for generating OpenAI embeddings for categories
Used by admin endpoints to auto-generate embeddings on create/update
"""
from typing import Optional, List
from openai import OpenAI
from ..config import settings
from .logging import structured_logger
from .retry import retry_with_backoff


class EmbeddingGenerator:
    """Generate embeddings for categories using OpenAI API"""
    
    def __init__(self):
        self.client: Optional[OpenAI] = None
        self.model_name = "text-embedding-3-small"
        self.logger = structured_logger
        self._initialize_client()
    
    def _initialize_client(self) -> None:
        """Initialize OpenAI client"""
        try:
            if not settings.openai_api_key:
                raise ValueError("OpenAI API key not found in environment variables")
            
            self.client = OpenAI(api_key=settings.openai_api_key)
            self.logger.info("Embedding generator OpenAI client initialized")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize embedding generator: {str(e)}")
            raise RuntimeError(f"Could not initialize embedding generator: {str(e)}")
    
    def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for a single text string
        
        Args:
            text: Input text to encode
            
        Returns:
            List of floats representing the embedding vector (1536 dimensions)
        """
        if not self.client:
            raise RuntimeError("OpenAI client not initialized")
        
        try:
            # Call OpenAI with retry logic
            @retry_with_backoff(max_retries=3, base_delay=1.0)
            def _create_embedding():
                return self.client.embeddings.create(
                    model=self.model_name,
                    input=[text],
                    encoding_format="float"
                )
            
            response = _create_embedding()
            embedding = response.data[0].embedding
            self.logger.info(f"Generated embedding for text: {text[:50]}...")
            
            return embedding
            
        except Exception as e:
            self.logger.error(f"Failed to generate embedding: {str(e)}")
            raise RuntimeError(f"Embedding generation failed: {str(e)}")
    
    def generate_category_embedding(self, name: str, description: str, keywords: Optional[List[str]] = None) -> List[float]:
        """
        Generate embedding for a category using name, description, and keywords
        
        Args:
            name: Category name
            description: Category description
            keywords: Optional list of keywords
            
        Returns:
            List of floats representing the embedding vector
        """
        # Combine name, description, and top keywords for rich semantic representation
        text_parts = [name, description]
        
        if keywords:
            # Add top 10 keywords for additional context
            top_keywords = ", ".join(keywords[:10])
            text_parts.append(top_keywords)
        
        combined_text = ". ".join(text_parts)
        
        return self.generate_embedding(combined_text)


# Global instance
_embedding_generator: Optional[EmbeddingGenerator] = None


def get_embedding_generator() -> EmbeddingGenerator:
    """
    Get or create the global embedding generator instance
    
    Returns:
        EmbeddingGenerator instance
    """
    global _embedding_generator
    
    if _embedding_generator is None:
        _embedding_generator = EmbeddingGenerator()
    
    return _embedding_generator
