"""
Text encoder using sentence transformers for semantic similarity matching
"""
import numpy as np
from typing import List, Optional, Dict, Any
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import logging
from ..config import settings
from ..utils.logging import structured_logger


class TextEncoder:
    """
    Text encoder for converting text to embeddings and calculating similarity
    """
    
    def __init__(self):
        self.model: Optional[SentenceTransformer] = None
        self.model_name = settings.ai_model_name
        self.vector_dimension = settings.vector_dimension
        self.logger = structured_logger
        # Don't load model immediately - load on first use
    
    def _ensure_model_loaded(self) -> None:
        """Ensure the model is loaded, load it if not"""
        if self.model is None:
            self._load_model()
    
    def _load_model(self) -> None:
        """Load the sentence transformer model"""
        try:
            self.logger.info(f"Loading text encoder model: {self.model_name}")
            self.logger.info("This may take 30-60 seconds for first download...")
            
            # Load with explicit cache directory and timeout handling
            self.model = SentenceTransformer(
                self.model_name,
                cache_folder=None,  # Use default cache
                use_auth_token=False
            )
            
            self.logger.info("Text encoder model loaded successfully")
            self.logger.info(f"Model max sequence length: {getattr(self.model, 'max_seq_length', 'unknown')}")
            
        except Exception as e:
            self.logger.error(f"Failed to load text encoder model: {str(e)}")
            self.logger.error(f"Error type: {type(e).__name__}")
            # Don't crash the whole app - just mark as failed
            self.model = None
            raise RuntimeError(f"Could not load text encoder model: {str(e)}")
    
    def encode_text(self, text: str) -> np.ndarray:
        """
        Encode a single text string to embeddings
        
        Args:
            text: Input text to encode
            
        Returns:
            numpy array of embeddings
        """
        self._ensure_model_loaded()
        
        if not text or not text.strip():
            raise ValueError("Input text cannot be empty")
        
        try:
            # Clean and normalize text
            cleaned_text = text.strip()
            
            # Generate embeddings
            embeddings = self.model.encode([cleaned_text])
            
            self.logger.debug(f"Encoded text: '{cleaned_text[:50]}...' -> {embeddings.shape}")
            
            return embeddings[0]
        
        except Exception as e:
            self.logger.error(f"Failed to encode text: {str(e)}")
            raise RuntimeError(f"Text encoding failed: {str(e)}")
    
    def encode_batch(self, texts: List[str]) -> np.ndarray:
        """
        Encode multiple text strings to embeddings
        
        Args:
            texts: List of input texts to encode
            
        Returns:
            numpy array of embeddings (one per text)
        """
        self._ensure_model_loaded()
        
        if not texts:
            raise ValueError("Input texts list cannot be empty")
        
        try:
            # Clean and normalize texts
            cleaned_texts = [text.strip() for text in texts if text and text.strip()]
            
            if not cleaned_texts:
                raise ValueError("No valid texts found after cleaning")
            
            # Generate embeddings
            embeddings = self.model.encode(cleaned_texts)
            
            self.logger.debug(f"Encoded {len(cleaned_texts)} texts -> {embeddings.shape}")
            
            return embeddings
        
        except Exception as e:
            self.logger.error(f"Failed to encode text batch: {str(e)}")
            raise RuntimeError(f"Batch text encoding failed: {str(e)}")
    
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
            
            # Calculate similarities
            similarities = []
            for i, candidate_embedding in enumerate(candidate_embeddings):
                similarity = self.calculate_similarity(query_embedding, candidate_embedding)
                similarities.append({
                    'index': i,
                    'text': candidate_texts[i],
                    'similarity': similarity
                })
            
            # Sort by similarity (highest first) and return top_k
            similarities.sort(key=lambda x: x['similarity'], reverse=True)
            
            return similarities[:top_k]
        
        except Exception as e:
            self.logger.error(f"Failed to find similar texts: {str(e)}")
            raise RuntimeError(f"Similarity search failed: {str(e)}")
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about the loaded model
        
        Returns:
            Dictionary with model information
        """
        return {
            'model_name': self.model_name,
            'vector_dimension': self.vector_dimension,
            'is_loaded': self.model is not None,
            'model_max_seq_length': getattr(self.model, 'max_seq_length', None) if self.model else None,
            'status': 'loaded' if self.model is not None else 'not_loaded'
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
