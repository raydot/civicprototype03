"""
Category matcher for VoterPrime AI recommendation system
Handles semantic matching between user priorities and political categories
"""
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from sklearn.metrics.pairwise import cosine_similarity
import json
from pathlib import Path

from .text_encoder import get_text_encoder
from ..utils.logging import structured_logger


@dataclass
class CategoryMatch:
    """Represents a category match with confidence scoring"""
    category_id: int
    category_name: str
    category_type: str  # 'issue', 'candidate', 'policy', 'attribute'
    similarity_score: float
    confidence_score: float
    confidence_label: str  # 'Strong Match', 'Good Match', 'Moderate Match'
    keywords: List[str]
    description: str  # Enriched description to help users feel heard
    metadata: Dict[str, Any]


class CategoryMatcher:
    """
    Semantic category matching using OpenAI embeddings for VoterPrime
    Matches user political priorities to candidates, issues, and policies
    """
    
    def __init__(self):
        """Initialize the category matcher with text encoder"""
        self.text_encoder = get_text_encoder()
        self.categories: List[Dict[str, Any]] = []
        self.category_embeddings: Optional[np.ndarray] = None
        self.logger = structured_logger
        self.session_id = None  # Track current session for collaborative filtering
        
        # Confidence scoring weights
        self.similarity_weight = 0.6
        self.keyword_weight = 0.2
        self.success_rate_weight = 0.2
        
        # Thresholds
        self.min_similarity_threshold = 0.15
        self.min_confidence_threshold = 0.25
    
    def load_categories(self, categories: List[Dict[str, Any]]) -> None:
        """
        Load political categories and use their pre-computed embeddings
        
        Args:
            categories: List of category dictionaries with structure:
                {
                    "id": int,
                    "name": str,
                    "type": str,  # 'issue', 'candidate', 'policy', 'attribute'
                    "description": str,
                    "keywords": List[str],
                    "embedding": List[float],  # Pre-computed embedding from database
                    "success_count": int,
                    "total_usage_count": int,
                    "metadata": Dict[str, Any]
                }
        """
        try:
            self.categories = categories
            self.logger.info(f"Loading {len(categories)} political categories")
            
            # Check if categories have pre-computed embeddings
            has_embeddings = all(cat.get('embedding') is not None for cat in categories)
            
            if has_embeddings:
                # Use pre-computed embeddings from database
                self.logger.info("Using pre-computed embeddings from database")
                embeddings_list = [np.array(cat['embedding']) for cat in categories]
                self.category_embeddings = np.array(embeddings_list)
                self.logger.info(f"Loaded embeddings shape: {self.category_embeddings.shape}")
            else:
                # Fallback: Generate embeddings if not in database
                self.logger.warning("No pre-computed embeddings found, generating new ones")
                category_texts = []
                for category in categories:
                    # Combine name, description, and keywords for rich semantic representation
                    text_parts = [
                        category['name'],
                        category.get('description', ''),
                        ' '.join(category.get('keywords', []))
                    ]
                    category_text = ' '.join(filter(None, text_parts))
                    category_texts.append(category_text)
                
                # Generate embeddings for all categories
                self.logger.info("Generating OpenAI embeddings for categories")
                self.category_embeddings = self.text_encoder.encode_batch(category_texts)
                self.logger.info(f"Category embeddings shape: {self.category_embeddings.shape}")
            
        except Exception as e:
            self.logger.error(f"Failed to load categories: {str(e)}")
            raise RuntimeError(f"Category loading failed: {str(e)}")
    
    async def find_matches(
        self, 
        user_input: str, 
        category_types: Optional[List[str]] = None,
        top_k: int = 5,
        session_id: Optional[str] = None
    ) -> List[CategoryMatch]:
        """
        Find matching categories for user political priorities
        
        Args:
            user_input: User's political priority text (e.g., "I care about climate change")
            category_types: Filter by category types ['issue', 'candidate', 'policy']
            top_k: Number of top matches to return
            session_id: Optional session ID for collaborative filtering
            
        Returns:
            List of CategoryMatch objects sorted by confidence score
        """
        # Store session ID for collaborative filtering
        self.session_id = session_id
        
        if not self.categories or self.category_embeddings is None:
            raise RuntimeError("Categories not loaded. Call load_categories() first.")
        
        try:
            self.logger.info(f"Finding matches for: '{user_input[:50]}...'")
            
            # Encode user input
            user_embedding = self.text_encoder.encode_text(user_input)
            self.logger.info(f"User embedding shape: {user_embedding.shape}, norm: {np.linalg.norm(user_embedding):.4f}")
            
            # Calculate similarities with all categories
            similarities = cosine_similarity(
                user_embedding.reshape(1, -1), 
                self.category_embeddings
            )[0]
            
            # Log similarity statistics
            self.logger.info(f"Similarity stats - min: {similarities.min():.4f}, max: {similarities.max():.4f}, mean: {similarities.mean():.4f}, std: {similarities.std():.4f}")
            
            # Log top 5 raw similarities for debugging
            top_indices = np.argsort(similarities)[-5:][::-1]
            for idx in top_indices:
                self.logger.info(f"  Top match: {self.categories[idx]['name'][:40]:40s} - similarity: {similarities[idx]:.4f}")
            
            # Create matches with confidence scoring
            matches = []
            for i, similarity in enumerate(similarities):
                category = self.categories[i]
                
                # Filter by category type if specified
                if category_types and category.get('type') not in category_types:
                    continue
                
                # Skip if below minimum similarity threshold
                if similarity < self.min_similarity_threshold:
                    continue
                
                # Calculate base confidence score
                confidence = self._calculate_confidence(similarity, category, user_input)
                
                # Skip if below minimum confidence threshold
                if confidence < self.min_confidence_threshold:
                    continue
                
                match = CategoryMatch(
                    category_id=category['id'],
                    category_name=category['name'],
                    category_type=category.get('type', 'unknown'),
                    similarity_score=float(similarity),
                    confidence_score=confidence,
                    confidence_label=self._get_confidence_label(confidence),
                    keywords=category.get('keywords', []),
                    description=category.get('description', ''),
                    metadata=category.get('metadata', {})
                )
                matches.append(match)
            
            # Apply pattern learning enhancements
            matches = await self._apply_pattern_learning(matches, user_input)
            
            # Recalculate confidence labels after pattern learning adjustments
            for match in matches:
                match.confidence_label = self._get_confidence_label(match.confidence_score)
            
            # Sort by enhanced confidence score (highest first)
            matches.sort(key=lambda x: x.confidence_score, reverse=True)
            
            # Return top_k matches
            top_matches = matches[:top_k]
            
            self.logger.info(f"Found {len(top_matches)} matches above threshold")
            
            return top_matches
        
        except Exception as e:
            self.logger.error(f"Failed to find matches: {str(e)}")
            raise RuntimeError(f"Category matching failed: {str(e)}")
    
    async def refine_matches(
        self, 
        user_input: str, 
        rejected_category_ids: List[int],
        category_types: Optional[List[str]] = None,
        top_k: int = 5
    ) -> List[CategoryMatch]:
        """
        Find alternative matches when user rejects initial suggestions
        
        Args:
            user_input: Original user input
            rejected_category_ids: IDs of categories user rejected
            category_types: Filter by category types
            top_k: Number of alternative matches to return
            
        Returns:
            List of alternative CategoryMatch objects
        """
        try:
            self.logger.info(f"Refining matches, excluding {len(rejected_category_ids)} rejected categories")
            
            # Get all matches
            all_matches = await self.find_matches(user_input, category_types, top_k * 3)
            
            # Filter out rejected categories
            refined_matches = [
                match for match in all_matches 
                if match.category_id not in rejected_category_ids
            ]
            
            # Apply penalty to similar categories (same type, overlapping keywords)
            for match in refined_matches:
                penalty = self._calculate_rejection_penalty(match, rejected_category_ids)
                match.confidence_score *= (1.0 - penalty)
            
            # Re-sort and return top_k
            refined_matches.sort(key=lambda x: x.confidence_score, reverse=True)
            
            self.logger.info(f"Refined to {len(refined_matches[:top_k])} alternative matches")
            
            return refined_matches[:top_k]
        
        except Exception as e:
            self.logger.error(f"Failed to refine matches: {str(e)}")
            raise RuntimeError(f"Match refinement failed: {str(e)}")
    
    def _calculate_confidence(
        self, 
        similarity_score: float, 
        category: Dict[str, Any], 
        user_input: str
    ) -> float:
        """
        Calculate confidence score combining similarity, keyword matches, and success rate
        
        Args:
            similarity_score: Cosine similarity score
            category: Category dictionary
            user_input: User's input text
            
        Returns:
            Confidence score between 0 and 1
        """
        # Base similarity component
        similarity_component = similarity_score * self.similarity_weight
        
        # Keyword matching bonus
        keyword_bonus = self._calculate_keyword_bonus(category.get('keywords', []), user_input)
        keyword_component = keyword_bonus * self.keyword_weight
        
        # Historical success rate component
        success_rate = self._calculate_success_rate(category)
        success_component = success_rate * self.success_rate_weight
        
        # Combine components
        confidence = similarity_component + keyword_component + success_component
        
        # Ensure confidence is between 0 and 1
        confidence = max(0.0, min(1.0, confidence))
        
        return confidence
    
    def _calculate_keyword_bonus(self, keywords: List[str], user_input: str) -> float:
        """Calculate bonus score for exact keyword matches"""
        if not keywords:
            return 0.0
        
        user_input_lower = user_input.lower()
        matches = sum(1 for keyword in keywords if keyword.lower() in user_input_lower)
        
        # Normalize by number of keywords
        return min(1.0, matches / len(keywords))
    
    def _get_confidence_label(self, confidence_score: float) -> str:
        """
        Convert confidence score to human-readable label
        
        Args:
            confidence_score: Confidence score between 0 and 1
            
        Returns:
            Confidence label: 'High Confidence', 'Medium Confidence', or 'Low Confidence'
        """
        if confidence_score >= 0.70:
            return "High Confidence"
        elif confidence_score >= 0.50:
            return "Medium Confidence"
        else:
            return "Low Confidence"
    
    def _calculate_success_rate(self, category: Dict[str, Any]) -> float:
        """Calculate historical success rate for the category"""
        success_count = category.get('success_count', 0)
        total_count = category.get('total_usage_count', 0)
        
        if total_count == 0:
            return 0.5  # Neutral score for new categories
        
        return success_count / total_count
    
    def _calculate_rejection_penalty(
        self, 
        match: CategoryMatch, 
        rejected_category_ids: List[int]
    ) -> float:
        """
        Calculate penalty for categories similar to rejected ones
        
        Returns:
            Penalty factor between 0 and 0.5 (reduces confidence)
        """
        penalty = 0.0
        
        # Find rejected categories
        rejected_categories = [
            cat for cat in self.categories 
            if cat['id'] in rejected_category_ids
        ]
        
        for rejected_cat in rejected_categories:
            # Penalty for same category type
            if match.category_type == rejected_cat.get('type'):
                penalty += 0.1
            
            # Penalty for overlapping keywords
            rejected_keywords = set(kw.lower() for kw in rejected_cat.get('keywords', []))
            match_keywords = set(kw.lower() for kw in match.keywords)
            
            if rejected_keywords and match_keywords:
                overlap = len(rejected_keywords & match_keywords) / len(rejected_keywords | match_keywords)
                penalty += overlap * 0.2
        
        return min(0.5, penalty)  # Cap penalty at 50%
    
    def get_category_by_id(self, category_id: int) -> Optional[Dict[str, Any]]:
        """Get category by ID"""
        for category in self.categories:
            if category['id'] == category_id:
                return category
        return None
    
    async def _apply_pattern_learning(
        self,
        matches: List[CategoryMatch],
        user_input: str
    ) -> List[CategoryMatch]:
        """
        Apply pattern learning enhancements to matches
        
        Uses learned patterns to:
        1. Apply feedback adjustments (boost/penalize based on historical feedback)
        2. Boost terms that co-occur with previously accepted terms
        3. Penalize terms with rejection patterns for similar queries
        
        Args:
            matches: Initial matches from similarity search
            user_input: User's query text
            
        Returns:
            Enhanced matches with adjusted confidence scores
        """
        try:
            from ..services.pattern_learning_service import get_pattern_learning_service
            pattern_service = get_pattern_learning_service()
            
            for match in matches:
                # 1. Apply feedback adjustment factor (0.7 to 1.3)
                adjustment_factor = await pattern_service.get_feedback_adjustment(match.category_id)
                match.confidence_score *= adjustment_factor
                
                # 2. Check for rejection patterns
                rejection_score = await pattern_service.get_rejection_score(
                    match.category_id,
                    user_input
                )
                # Penalize if this term has been rejected for similar queries
                if rejection_score > 0:
                    match.confidence_score *= (1.0 - (rejection_score * 0.2))  # Up to 20% penalty
                
                # 3. Collaborative filtering: Boost based on co-occurrences
                # "People who selected X also selected Y"
                # Get previously accepted terms from current session (if available)
                if self.session_id:
                    accepted_term_ids = await self._get_session_accepted_terms(self.session_id)
                    if accepted_term_ids:
                        co_occurrence_boost = await pattern_service.get_co_occurrence_boost(
                            match.category_id,
                            accepted_term_ids
                        )
                        if co_occurrence_boost > 0:
                            match.confidence_score += co_occurrence_boost
                            self.logger.info(
                                f"Applied collaborative filtering boost: {co_occurrence_boost:.2%} "
                                f"to '{match.category_name}' (new score: {match.confidence_score:.2f})"
                            )
                
                # Ensure confidence stays in valid range
                match.confidence_score = max(0.0, min(1.0, match.confidence_score))
            
            return matches
            
        except Exception as e:
            self.logger.warning(f"Pattern learning enhancement failed (non-critical): {str(e)}")
            # Return original matches if pattern learning fails
            return matches
    
    async def _get_session_accepted_terms(self, session_id: str) -> List[int]:
        """
        Get list of term IDs that user has accepted in this session
        Used for collaborative filtering
        
        Args:
            session_id: Session identifier
            
        Returns:
            List of accepted category IDs
        """
        try:
            from ..db.database import database
            
            # Query user interactions to find accepted terms in this session
            query = """
            SELECT DISTINCT category_id
            FROM user_interactions
            WHERE session_id = :session_id
                AND feedback_type = 'accept'
                AND created_at > NOW() - INTERVAL '1 hour'
            ORDER BY created_at DESC
            LIMIT 10
            """
            
            results = await database.fetch_all(query, {"session_id": session_id})
            
            accepted_ids = [row["category_id"] for row in results]
            
            if accepted_ids:
                self.logger.info(f"Found {len(accepted_ids)} accepted terms in session for collaborative filtering")
            
            return accepted_ids
            
        except Exception as e:
            self.logger.warning(f"Failed to get session accepted terms: {str(e)}")
            return []
    
    def get_categories_by_type(self, category_type: str) -> List[Dict[str, Any]]:
        """Get all categories of a specific type"""
        return [cat for cat in self.categories if cat.get('type') == category_type]
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the category matcher"""
        return {
            'total_categories': len(self.categories),
            'categories_by_type': {
                cat_type: len(self.get_categories_by_type(cat_type))
                for cat_type in set(cat.get('type', 'unknown') for cat in self.categories)
            },
            'embedding_model': self.text_encoder.get_model_info(),
            'confidence_weights': {
                'similarity': self.similarity_weight,
                'keywords': self.keyword_weight,
                'success_rate': self.success_rate_weight
            },
            'thresholds': {
                'min_similarity': self.min_similarity_threshold,
                'min_confidence': self.min_confidence_threshold
            }
        }


# Global category matcher instance (singleton pattern)
_category_matcher_instance: Optional[CategoryMatcher] = None


def get_category_matcher() -> CategoryMatcher:
    """
    Get or create the global category matcher instance
    
    Returns:
        CategoryMatcher instance
    """
    global _category_matcher_instance
    
    if _category_matcher_instance is None:
        _category_matcher_instance = CategoryMatcher()
    
    return _category_matcher_instance
