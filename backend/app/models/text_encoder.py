"""
Text encoder using OpenAI embeddings API for semantic similarity matching
"""
import numpy as np
from typing import List, Optional, Dict, Any
from openai import OpenAI
from sklearn.metrics.pairwise import cosine_similarity
import logging
from ..config import settings
from ..utils.logging import structured_logger


class TextEncoder:
    """
    Text encoder for converting text to embeddings and calculating similarity using OpenAI API
    """
    
    def __init__(self):
        self.client: Optional[OpenAI] = None
        self.model_name = "text-embedding-3-small"  # OpenAI's efficient embedding model
        self.vector_dimension = 1536  # OpenAI embedding dimension
        self.logger = structured_logger
        # Initialize OpenAI client immediately since it's lightweight
        self._initialize_client()
    
    def _initialize_client(self) -> None:
        """Initialize the OpenAI client"""
        try:
            if not settings.openai_api_key:
                raise ValueError("OpenAI API key not found in environment variables")
            
            self.client = OpenAI(api_key=settings.openai_api_key)
            self.logger.info("OpenAI client initialized successfully")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize OpenAI client: {str(e)}")
            raise RuntimeError(f"Could not initialize OpenAI client: {str(e)}")
    
    def encode_text(self, text: str) -> np.ndarray:
        """
        Encode a single text string to embeddings using OpenAI API
        
        Args:
            text: Input text to encode
            
        Returns:
            numpy array of embeddings
        """
        if not self.client:
            raise RuntimeError("OpenAI client not initialized")
        
        if not text or not text.strip():
            raise ValueError("Input text cannot be empty")
        
        try:
            # Clean and normalize text
            cleaned_text = text.strip()
            
            self.logger.info(f"Encoding text with OpenAI: '{cleaned_text[:50]}...'")
            
            # Call OpenAI embeddings API
            response = self.client.embeddings.create(
                model=self.model_name,
                input=cleaned_text
            )
            
            # Extract embeddings from response
            embeddings = np.array(response.data[0].embedding)
            
            self.logger.info(f"Encoded text -> {embeddings.shape}")
            
            return embeddings
        
        except Exception as e:
            self.logger.error(f"Failed to encode text with OpenAI: {str(e)}")
            raise RuntimeError(f"OpenAI text encoding failed: {str(e)}")
    
    def encode_batch(self, texts: List[str]) -> np.ndarray:
        """
        Encode multiple text strings to embeddings using OpenAI API
        
        Args:
            texts: List of input texts to encode
            
        Returns:
            numpy array of embeddings (one per text)
        """
        if not self.client:
            raise RuntimeError("OpenAI client not initialized")
        
        if not texts:
            raise ValueError("Input texts list cannot be empty")
        
        try:
            # Clean and normalize texts
            cleaned_texts = [text.strip() for text in texts if text and text.strip()]
            
            if not cleaned_texts:
                raise ValueError("No valid texts found after cleaning")
            
            self.logger.info(f"Encoding {len(cleaned_texts)} texts with OpenAI")
            
            # Call OpenAI embeddings API with batch
            response = self.client.embeddings.create(
                model=self.model_name,
                input=cleaned_texts
            )
            
            # Extract embeddings from response
            embeddings = np.array([item.embedding for item in response.data])
            
            self.logger.info(f"Encoded {len(cleaned_texts)} texts -> {embeddings.shape}")
            
            return embeddings
        
        except Exception as e:
            self.logger.error(f"Failed to encode text batch with OpenAI: {str(e)}")
            raise RuntimeError(f"OpenAI batch text encoding failed: {str(e)}")
    
    def calculate_similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """
        Calculate cosine similarity between two embeddings
        
        Args:
            embedding1: First embedding vector
            embedding2: Second embedding vector
            
        Returns:
            Similarity score between 0 and 1
        """
        try:
            # Reshape if needed
            if embedding1.ndim == 1:
                embedding1 = embedding1.reshape(1, -1)
            if embedding2.ndim == 1:
                embedding2 = embedding2.reshape(1, -1)
            
            # Calculate cosine similarity
            similarity = cosine_similarity(embedding1, embedding2)[0][0]
            
            # Ensure score is between 0 and 1
            similarity = max(0.0, min(1.0, similarity))
            
            return float(similarity)
        
        except Exception as e:
            self.logger.error(f"Failed to calculate similarity: {str(e)}")
            raise RuntimeError(f"Similarity calculation failed: {str(e)}")
    
    def find_most_similar(
        self, 
        query_text: str, 
        candidate_texts: List[str], 
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Find most similar texts to a query
        
        Args:
            query_text: Text to find matches for
            candidate_texts: List of texts to search through
            top_k: Number of top matches to return
            
        Returns:
            List of matches with similarity scores
        """
        try:
            # Encode query and candidates
            query_embedding = self.encode_text(query_text)
            candidate_embeddings = self.encode_batch(candidate_texts)
            
            # Calculate similarity
            similarity_scores = []
            for i, candidate_embedding in enumerate(candidate_embeddings):
                similarity_score = self.calculate_similarity(query_embedding, candidate_embedding)
                similarity_scores.append({
                    'index': i,
                    'text': candidate_texts[i],
                    'similarity': similarity_score
                })
            
            # Sort by similarity (highest first) and return top_k
            similarity_scores.sort(key=lambda x: x['similarity'], reverse=True)
            
            return similarity_scores[:top_k]
        
        except Exception as e:
            self.logger.error(f"Failed to find similar texts: {str(e)}")
            raise RuntimeError(f"Similarity search failed: {str(e)}")
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about the OpenAI model
        
        Returns:
            Dictionary with model information
        """
        return {
            'model_name': self.model_name,
            'vector_dimension': self.vector_dimension,
            'is_loaded': self.client is not None,
            'api_provider': 'OpenAI',
            'status': 'ready' if self.client is not None else 'not_initialized'
        }


# Global text encoder instance (singleton pattern)
_text_encoder_instance: Optional[TextEncoder] = None


def get_text_encoder() -> TextEncoder:
    """
    Get or create the global text encoder instance
    
    Returns:
        TextEncoder instance
    """
    global _text_encoder_instance
    
    if _text_encoder_instance is None:
        _text_encoder_instance = TextEncoder()
    
    return _text_encoder_instance
