"""
Learning Service - Processes feedback to improve category recommendations

This service implements the feedback learning loop:
1. Collects user feedback on category matches
2. Updates category success rates and confidence scores
3. Identifies underperforming categories
4. Suggests improvements to keywords and categories
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging
from collections import Counter

from ..db.database import database

# Use standard logging
logger = logging.getLogger(__name__)


class CategoryLearningService:
    """
    Processes feedback to improve category performance over time.
    
    Tracks:
    - Category success rates (acceptance vs rejection)
    - Average confidence scores
    - User satisfaction ratings
    - Performance trends over time
    """
    
    async def update_category_metrics(
        self, 
        category_id: int,
        feedback_type: str,
        confidence_score: float,
        user_rating: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Update metrics when user provides feedback on a category.
        
        Args:
            category_id: ID of the category
            feedback_type: 'accept', 'reject', 'maybe', 'irrelevant'
            confidence_score: Original confidence score (0-1)
            user_rating: Optional user rating (1-5)
            
        Returns:
            Updated metrics for the category
        """
        if database is None:
            logger.warning("Database not available - skipping metrics update")
            return {"status": "skipped"}
        
        try:
            # Calculate success rate over last 30 days
            success_rate = await self._calculate_success_rate(category_id, days=30)
            
            # Get average confidence for accepted matches
            avg_confidence = await self._calculate_average_confidence(category_id, days=30)
            
            # Get average user rating
            avg_rating = await self._calculate_average_rating(category_id, days=30)
            
            # Store updated metrics
            await self._store_metrics(
                category_id=category_id,
                success_rate=success_rate,
                avg_confidence=avg_confidence,
                avg_rating=avg_rating
            )
            
            logger.info(f"Updated metrics for category {category_id}: success_rate={success_rate:.2f}")
            
            return {
                "category_id": category_id,
                "success_rate": success_rate,
                "avg_confidence": avg_confidence,
                "avg_rating": avg_rating,
                "updated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to update category metrics: {str(e)}")
            raise
    
    async def _calculate_success_rate(self, category_id: int, days: int = 30) -> float:
        """
        Calculate success rate (acceptance rate) for a category.
        
        Success = feedback_type in ('accept', 'maybe')
        Failure = feedback_type in ('reject', 'irrelevant')
        """
        query = """
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE feedback_type IN ('accept', 'maybe')) as successful
        FROM category_feedback
        WHERE category_id = :category_id
        AND created_at > NOW() - INTERVAL '%s days'
        """ % days
        
        result = await database.fetch_one(query, {"category_id": category_id})
        
        if not result or result['total'] == 0:
            return 0.0
        
        return result['successful'] / result['total']
    
    async def _calculate_average_confidence(self, category_id: int, days: int = 30) -> float:
        """Calculate average confidence score for accepted matches."""
        query = """
        SELECT AVG(confidence_score) as avg_confidence
        FROM category_feedback
        WHERE category_id = :category_id
        AND feedback_type IN ('accept', 'maybe')
        AND created_at > NOW() - INTERVAL '%s days'
        """ % days
        
        result = await database.fetch_one(query, {"category_id": category_id})
        
        return float(result['avg_confidence']) if result and result['avg_confidence'] else 0.0
    
    async def _calculate_average_rating(self, category_id: int, days: int = 30) -> float:
        """Calculate average user rating for a category."""
        query = """
        SELECT AVG(user_rating) as avg_rating
        FROM category_feedback
        WHERE category_id = :category_id
        AND user_rating IS NOT NULL
        AND created_at > NOW() - INTERVAL '%s days'
        """ % days
        
        result = await database.fetch_one(query, {"category_id": category_id})
        
        return float(result['avg_rating']) if result and result['avg_rating'] else 0.0
    
    async def _store_metrics(
        self,
        category_id: int,
        success_rate: float,
        avg_confidence: float,
        avg_rating: float
    ):
        """Store calculated metrics in learning_metrics table."""
        # Store success rate
        await self._store_single_metric(
            category_id=category_id,
            metric_type='success_rate',
            metric_value=success_rate
        )
        
        # Store average confidence
        await self._store_single_metric(
            category_id=category_id,
            metric_type='avg_confidence',
            metric_value=avg_confidence
        )
        
        # Store average rating
        if avg_rating > 0:
            await self._store_single_metric(
                category_id=category_id,
                metric_type='avg_rating',
                metric_value=avg_rating
            )
    
    async def _store_single_metric(
        self,
        category_id: int,
        metric_type: str,
        metric_value: float
    ):
        """Store a single metric value."""
        query = """
        INSERT INTO learning_metrics 
        (category_id, metric_type, metric_value, sample_size, time_period, calculated_at)
        VALUES (:category_id, :metric_type, :metric_value, 1, 'daily', NOW())
        """
        
        await database.execute(
            query,
            {
                "category_id": category_id,
                "metric_type": metric_type,
                "metric_value": metric_value
            }
        )
    
    async def identify_underperforming_categories(
        self,
        success_threshold: float = 0.3,
        min_samples: int = 10,
        days: int = 30
    ) -> List[Dict[str, Any]]:
        """
        Identify categories that are performing poorly.
        
        Args:
            success_threshold: Minimum acceptable success rate (default: 30%)
            min_samples: Minimum number of feedback samples required
            days: Time window to analyze
            
        Returns:
            List of underperforming categories with details
        """
        if database is None:
            logger.warning("Database not available")
            return []
        
        query = """
        WITH category_stats AS (
            SELECT 
                cf.category_id,
                cf.category_name,
                COUNT(*) as total_feedback,
                COUNT(*) FILTER (WHERE feedback_type IN ('accept', 'maybe')) as successful,
                AVG(user_rating) as avg_rating,
                AVG(confidence_score) as avg_confidence
            FROM category_feedback cf
            WHERE cf.created_at > NOW() - INTERVAL '%s days'
            GROUP BY cf.category_id, cf.category_name
            HAVING COUNT(*) >= :min_samples
        )
        SELECT 
            category_id,
            category_name,
            total_feedback,
            successful,
            ROUND((successful::numeric / total_feedback)::numeric, 3) as success_rate,
            ROUND(avg_rating::numeric, 2) as avg_rating,
            ROUND(avg_confidence::numeric, 3) as avg_confidence
        FROM category_stats
        WHERE (successful::numeric / total_feedback) < :threshold
        ORDER BY success_rate ASC, total_feedback DESC
        """ % days
        
        results = await database.fetch_all(
            query,
            {
                "threshold": success_threshold,
                "min_samples": min_samples
            }
        )
        
        underperforming = [dict(row) for row in results]
        
        if underperforming:
            logger.info(f"Found {len(underperforming)} underperforming categories")
        
        return underperforming
    
    async def get_category_performance_summary(
        self,
        category_id: int,
        days: int = 30
    ) -> Dict[str, Any]:
        """
        Get comprehensive performance summary for a category.
        
        Returns metrics, trends, and suggestions for improvement.
        """
        if database is None:
            return {"error": "Database not available"}
        
        # Get basic stats
        stats_query = """
        SELECT 
            COUNT(*) as total_feedback,
            COUNT(*) FILTER (WHERE feedback_type = 'accept') as accepts,
            COUNT(*) FILTER (WHERE feedback_type = 'reject') as rejects,
            COUNT(*) FILTER (WHERE feedback_type = 'maybe') as maybes,
            COUNT(*) FILTER (WHERE feedback_type = 'irrelevant') as irrelevant,
            AVG(confidence_score) as avg_confidence,
            AVG(user_rating) as avg_rating
        FROM category_feedback
        WHERE category_id = :category_id
        AND created_at > NOW() - INTERVAL '%s days'
        """ % days
        
        stats = await database.fetch_one(stats_query, {"category_id": category_id})
        
        if not stats or stats['total_feedback'] == 0:
            return {
                "category_id": category_id,
                "error": "No feedback data available",
                "days": days
            }
        
        # Calculate success rate
        success_rate = (stats['accepts'] + stats['maybes']) / stats['total_feedback']
        
        # Get common rejection reasons
        rejection_reasons = await self._get_rejection_reasons(category_id, days)
        
        return {
            "category_id": category_id,
            "period_days": days,
            "total_feedback": stats['total_feedback'],
            "breakdown": {
                "accepts": stats['accepts'],
                "rejects": stats['rejects'],
                "maybes": stats['maybes'],
                "irrelevant": stats['irrelevant']
            },
            "success_rate": round(success_rate, 3),
            "avg_confidence": round(float(stats['avg_confidence']), 3),
            "avg_rating": round(float(stats['avg_rating']), 2) if stats['avg_rating'] else None,
            "rejection_reasons": rejection_reasons,
            "status": self._categorize_performance(success_rate),
            "recommendations": self._generate_recommendations(success_rate, stats)
        }
    
    async def _get_rejection_reasons(self, category_id: int, days: int) -> List[Dict[str, Any]]:
        """Get common reasons for rejection."""
        query = """
        SELECT 
            feedback_reason,
            COUNT(*) as count
        FROM category_feedback
        WHERE category_id = :category_id
        AND feedback_type IN ('reject', 'irrelevant')
        AND feedback_reason IS NOT NULL
        AND created_at > NOW() - INTERVAL '%s days'
        GROUP BY feedback_reason
        ORDER BY count DESC
        LIMIT 5
        """ % days
        
        results = await database.fetch_all(query, {"category_id": category_id})
        return [dict(row) for row in results]
    
    def _categorize_performance(self, success_rate: float) -> str:
        """Categorize performance level."""
        if success_rate >= 0.7:
            return "excellent"
        elif success_rate >= 0.5:
            return "good"
        elif success_rate >= 0.3:
            return "needs_improvement"
        else:
            return "poor"
    
    def _generate_recommendations(self, success_rate: float, stats: Dict) -> List[str]:
        """Generate actionable recommendations based on performance."""
        recommendations = []
        
        if success_rate < 0.3:
            recommendations.append("Consider reviewing and updating category keywords")
            recommendations.append("Category may be too broad or too narrow")
        
        if success_rate < 0.5:
            recommendations.append("Review recent rejected matches for patterns")
        
        if stats['irrelevant'] > stats['total_feedback'] * 0.3:
            recommendations.append("High irrelevant rate - category definition may need clarification")
        
        if stats['avg_confidence'] < 0.5:
            recommendations.append("Low confidence scores - improve keyword matching")
        
        if not recommendations:
            recommendations.append("Performance is good - continue monitoring")
        
        return recommendations


class FeedbackAnalyzer:
    """
    Analyzes feedback patterns to identify insights and improvement opportunities.
    """
    
    async def analyze_rejection_patterns(
        self,
        category_id: Optional[int] = None,
        days: int = 30
    ) -> Dict[str, Any]:
        """
        Analyze why users are rejecting category matches.
        
        Identifies:
        - Common rejection reasons
        - Patterns in rejected user inputs
        - Confidence score correlations
        """
        if database is None:
            return {"error": "Database not available"}
        
        # Build query based on whether we're analyzing a specific category
        if category_id:
            where_clause = "WHERE cf.category_id = :category_id AND cf.feedback_type IN ('reject', 'irrelevant')"
            params = {"category_id": category_id}
        else:
            where_clause = "WHERE cf.feedback_type IN ('reject', 'irrelevant')"
            params = {}
        
        query = f"""
        SELECT 
            cf.category_id,
            cf.category_name,
            COUNT(*) as rejection_count,
            AVG(cf.confidence_score) as avg_confidence,
            ARRAY_AGG(DISTINCT cf.feedback_reason) FILTER (WHERE cf.feedback_reason IS NOT NULL) as reasons
        FROM category_feedback cf
        JOIN user_interactions ui ON cf.interaction_id = ui.id
        {where_clause}
        AND cf.created_at > NOW() - INTERVAL '%s days'
        GROUP BY cf.category_id, cf.category_name
        ORDER BY rejection_count DESC
        LIMIT 10
        """ % days
        
        results = await database.fetch_all(query, params)
        
        return {
            "period_days": days,
            "category_id": category_id,
            "rejection_patterns": [dict(row) for row in results]
        }
    
    async def identify_missing_categories(
        self,
        confidence_threshold: float = 0.5,
        frequency_threshold: int = 5,
        days: int = 30
    ) -> List[Dict[str, Any]]:
        """
        Identify patterns in low-confidence matches that might indicate missing categories.
        
        Args:
            confidence_threshold: Max confidence to consider "low" (default: 0.5)
            frequency_threshold: Min occurrences to suggest new category (default: 5)
            days: Time window to analyze
            
        Returns:
            Suggested new categories based on patterns
        """
        if database is None:
            return []
        
        # Find interactions with low confidence matches
        query = """
        SELECT 
            ui.user_input,
            cf.category_name as best_match,
            cf.confidence_score,
            cf.feedback_type
        FROM user_interactions ui
        JOIN category_feedback cf ON ui.id = cf.interaction_id
        WHERE cf.confidence_score < :threshold
        AND ui.created_at > NOW() - INTERVAL '%s days'
        ORDER BY ui.created_at DESC
        LIMIT 100
        """ % days
        
        results = await database.fetch_all(query, {"threshold": confidence_threshold})
        
        # Analyze patterns (simplified - in production would use NLP clustering)
        low_confidence_inputs = [row['user_input'] for row in results]
        
        # Extract common words (basic implementation)
        word_freq = Counter()
        for input_text in low_confidence_inputs:
            words = input_text.lower().split()
            word_freq.update(words)
        
        # Find common themes
        common_themes = [
            {
                "theme": word,
                "frequency": count,
                "suggestion": f"Consider creating category related to '{word}'"
            }
            for word, count in word_freq.most_common(10)
            if count >= frequency_threshold and len(word) > 3
        ]
        
        logger.info(f"Identified {len(common_themes)} potential missing categories")
        
        return common_themes


# Convenience function to get learning service instance
def get_learning_service() -> CategoryLearningService:
    """Get CategoryLearningService instance."""
    return CategoryLearningService()


def get_feedback_analyzer() -> FeedbackAnalyzer:
    """Get FeedbackAnalyzer instance."""
    return FeedbackAnalyzer()
