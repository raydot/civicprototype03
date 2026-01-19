"""
Pattern Learning Service

Tracks user feedback patterns to improve matching over time through:
1. Co-occurrence tracking - Which terms users accept together
2. Rejection patterns - Which terms get rejected for which queries
3. Feedback adjustments - Algorithmic score adjustments based on feedback
"""
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from ..db.database import database
from ..utils.logging import structured_logger as logger


class PatternLearningService:
    """
    Service for learning from user feedback patterns to improve matching
    """
    
    async def track_co_occurrence(
        self,
        accepted_term_ids: List[int],
        session_id: str
    ) -> None:
        """
        Track which terms users accept together in the same session
        
        Args:
            accepted_term_ids: List of term IDs user accepted
            session_id: Session identifier for grouping
        """
        if len(accepted_term_ids) < 2:
            return  # Need at least 2 terms for co-occurrence
        
        try:
            # Create pairs of all accepted terms
            for i in range(len(accepted_term_ids)):
                for j in range(i + 1, len(accepted_term_ids)):
                    term_id_1 = min(accepted_term_ids[i], accepted_term_ids[j])
                    term_id_2 = max(accepted_term_ids[i], accepted_term_ids[j])
                    
                    # Upsert co-occurrence record
                    query = """
                    INSERT INTO term_co_occurrences 
                        (term_id_1, term_id_2, co_occurrence_count, last_occurred_at)
                    VALUES 
                        (:term_id_1, :term_id_2, 1, NOW())
                    ON CONFLICT (term_id_1, term_id_2) 
                    DO UPDATE SET
                        co_occurrence_count = term_co_occurrences.co_occurrence_count + 1,
                        last_occurred_at = NOW()
                    """
                    
                    await database.execute(
                        query,
                        {
                            "term_id_1": term_id_1,
                            "term_id_2": term_id_2
                        }
                    )
            
            logger.info(f"Tracked co-occurrences for {len(accepted_term_ids)} terms in session {session_id}")
            
        except Exception as e:
            logger.error(f"Failed to track co-occurrence: {str(e)}")
    
    async def track_rejection(
        self,
        term_id: int,
        query_text: str
    ) -> None:
        """
        Track when a term gets rejected for a specific query pattern
        
        Args:
            term_id: ID of rejected term
            query_text: User's query that led to this rejection
        """
        try:
            # Normalize query for pattern matching (lowercase, trim)
            query_pattern = query_text.lower().strip()[:500]
            
            # Upsert rejection pattern
            query = """
            INSERT INTO rejection_patterns
                (term_id, query_pattern, rejection_count, last_rejected_at)
            VALUES
                (:term_id, :query_pattern, 1, NOW())
            ON CONFLICT (term_id, query_pattern)
            DO UPDATE SET
                rejection_count = rejection_patterns.rejection_count + 1,
                last_rejected_at = NOW()
            """
            
            await database.execute(
                query,
                {
                    "term_id": term_id,
                    "query_pattern": query_pattern
                }
            )
            
            logger.info(f"Tracked rejection for term {term_id} with query pattern: {query_pattern[:50]}")
            
        except Exception as e:
            logger.error(f"Failed to track rejection: {str(e)}")
    
    async def update_feedback_adjustment(
        self,
        term_id: int,
        is_positive: bool
    ) -> None:
        """
        Update algorithmic adjustment factor based on feedback
        
        Args:
            term_id: ID of the term
            is_positive: True for thumbs up, False for thumbs down
        """
        try:
            # Get current adjustment or create new one
            query = """
            INSERT INTO feedback_adjustments
                (term_id, adjustment_factor, positive_feedback_count, negative_feedback_count, last_updated_at)
            VALUES
                (:term_id, 1.0, 0, 0, NOW())
            ON CONFLICT (term_id)
            DO NOTHING
            RETURNING id
            """
            
            await database.execute(query, {"term_id": term_id})
            
            # Update counts
            if is_positive:
                update_query = """
                UPDATE feedback_adjustments
                SET 
                    positive_feedback_count = positive_feedback_count + 1,
                    last_updated_at = NOW()
                WHERE term_id = :term_id
                """
            else:
                update_query = """
                UPDATE feedback_adjustments
                SET 
                    negative_feedback_count = negative_feedback_count + 1,
                    last_updated_at = NOW()
                WHERE term_id = :term_id
                """
            
            await database.execute(update_query, {"term_id": term_id})
            
            # Recalculate adjustment factor
            await self._recalculate_adjustment_factor(term_id)
            
            logger.info(f"Updated feedback adjustment for term {term_id}: {'positive' if is_positive else 'negative'}")
            
        except Exception as e:
            logger.error(f"Failed to update feedback adjustment: {str(e)}")
    
    async def _recalculate_adjustment_factor(self, term_id: int) -> None:
        """
        Recalculate the adjustment factor based on feedback ratio
        
        Factor ranges from 0.7 (mostly negative) to 1.3 (mostly positive)
        """
        try:
            # Get feedback counts
            query = """
            SELECT positive_feedback_count, negative_feedback_count
            FROM feedback_adjustments
            WHERE term_id = :term_id
            """
            
            result = await database.fetch_one(query, {"term_id": term_id})
            
            if not result:
                return
            
            positive = result["positive_feedback_count"]
            negative = result["negative_feedback_count"]
            total = positive + negative
            
            if total == 0:
                adjustment_factor = 1.0
            else:
                # Calculate ratio: 0 (all negative) to 1 (all positive)
                ratio = positive / total
                
                # Map to adjustment factor: 0.7 to 1.3
                # ratio 0.0 -> 0.7
                # ratio 0.5 -> 1.0
                # ratio 1.0 -> 1.3
                adjustment_factor = 0.7 + (ratio * 0.6)
            
            # Update adjustment factor
            update_query = """
            UPDATE feedback_adjustments
            SET adjustment_factor = :factor
            WHERE term_id = :term_id
            """
            
            await database.execute(
                update_query,
                {"term_id": term_id, "factor": adjustment_factor}
            )
            
        except Exception as e:
            logger.error(f"Failed to recalculate adjustment factor: {str(e)}")
    
    async def get_co_occurring_terms(
        self,
        term_id: int,
        min_occurrences: int = 2,
        limit: int = 10
    ) -> List[Tuple[int, int]]:
        """
        Get terms that frequently co-occur with the given term
        
        Args:
            term_id: ID of the term to find co-occurrences for
            min_occurrences: Minimum number of co-occurrences to include
            limit: Maximum number of results
            
        Returns:
            List of (term_id, co_occurrence_count) tuples
        """
        try:
            query = """
            SELECT 
                CASE 
                    WHEN term_id_1 = :term_id THEN term_id_2
                    ELSE term_id_1
                END as related_term_id,
                co_occurrence_count
            FROM term_co_occurrences
            WHERE (term_id_1 = :term_id OR term_id_2 = :term_id)
                AND co_occurrence_count >= :min_occurrences
            ORDER BY co_occurrence_count DESC
            LIMIT :limit
            """
            
            results = await database.fetch_all(
                query,
                {
                    "term_id": term_id,
                    "min_occurrences": min_occurrences,
                    "limit": limit
                }
            )
            
            return [(row["related_term_id"], row["co_occurrence_count"]) for row in results]
            
        except Exception as e:
            logger.error(f"Failed to get co-occurring terms: {str(e)}")
            return []
    
    async def get_rejection_score(
        self,
        term_id: int,
        query_text: str
    ) -> float:
        """
        Get rejection score for a term given a query
        Higher score = more likely to be rejected
        
        Args:
            term_id: ID of the term
            query_text: User's query
            
        Returns:
            Rejection score between 0 and 1
        """
        try:
            query_pattern = query_text.lower().strip()[:500]
            
            # Check for exact pattern match
            query = """
            SELECT rejection_count
            FROM rejection_patterns
            WHERE term_id = :term_id AND query_pattern = :query_pattern
            """
            
            result = await database.fetch_one(
                query,
                {"term_id": term_id, "query_pattern": query_pattern}
            )
            
            if not result:
                return 0.0
            
            # Convert rejection count to score (capped at 1.0)
            # 1 rejection = 0.2, 5+ rejections = 1.0
            rejection_count = result["rejection_count"]
            score = min(1.0, rejection_count * 0.2)
            
            return score
            
        except Exception as e:
            logger.error(f"Failed to get rejection score: {str(e)}")
            return 0.0
    
    async def get_feedback_adjustment(self, term_id: int) -> float:
        """
        Get the current feedback adjustment factor for a term
        
        Args:
            term_id: ID of the term
            
        Returns:
            Adjustment factor (0.7 to 1.3, default 1.0)
        """
        try:
            query = """
            SELECT adjustment_factor
            FROM feedback_adjustments
            WHERE term_id = :term_id
            """
            
            result = await database.fetch_one(query, {"term_id": term_id})
            
            if not result:
                return 1.0  # Neutral adjustment
            
            return float(result["adjustment_factor"])
            
        except Exception as e:
            logger.error(f"Failed to get feedback adjustment: {str(e)}")
            return 1.0


# Singleton instance
_pattern_learning_service: Optional[PatternLearningService] = None


def get_pattern_learning_service() -> PatternLearningService:
    """Get or create the pattern learning service singleton"""
    global _pattern_learning_service
    if _pattern_learning_service is None:
        _pattern_learning_service = PatternLearningService()
    return _pattern_learning_service
