"""
User Feedback Collection Service
Handles session management, interaction tracking, and feedback collection
"""
import json
import uuid
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import Request, HTTPException
import hashlib
import time

from ..config import settings
from ..db.database import database
from ..utils.logging import structured_logger

logger = structured_logger


class UserSession:
    """Manages user session creation and tracking."""
    
    def __init__(self, request: Request):
        self.user_ip = request.client.host
        self.user_agent = request.headers.get("user-agent", "")
        self.session_id = self._generate_session_id(request)
    
    def _generate_session_id(self, request: Request) -> str:
        """Generate unique session ID based on IP and user agent."""
        # Create a hash of IP + user agent + timestamp for uniqueness
        session_data = f"{self.user_ip}:{self.user_agent}:{int(time.time() / 3600)}"  # Hour-based sessions
        return hashlib.md5(session_data.encode()).hexdigest()
    
    async def create_or_update_session(self) -> str:
        """Create new session or update existing one."""
        if database is None:
            logger.warning("Database not available - using session ID without persistence")
            return self.session_id
            
        try:
            query = """
            INSERT INTO user_sessions (session_id, user_ip, user_agent, last_activity)
            VALUES ($1, $2, $3, NOW())
            ON CONFLICT (session_id) 
            DO UPDATE SET 
                last_activity = NOW(),
                total_interactions = user_sessions.total_interactions + 1
            RETURNING id, session_id
            """
            
            result = await database.fetch_one(
                query, 
                self.session_id, 
                self.user_ip, 
                self.user_agent
            )
            
            logger.info(f"Session created/updated: {self.session_id}")
            return self.session_id
            
        except Exception as e:
            logger.error(f"Failed to create/update session: {str(e)}")
            raise HTTPException(status_code=500, detail="Session management failed")


class InteractionTracker:
    """Tracks user interactions with the AI system."""
    
    async def track_category_matching(
        self, 
        session_id: str, 
        user_input: str, 
        matches: List[Dict[str, Any]],
        processing_time: int,
        original_query: Optional[str] = None
    ) -> str:
        """Track a category matching interaction."""
        
        if database is None:
            logger.warning("Database not available - skipping interaction tracking")
            return str(uuid.uuid4())  # Return a fake interaction ID
        
        try:
            # Create interaction record
            interaction_query = """
            INSERT INTO user_interactions 
            (session_id, interaction_type, user_input, original_query, processing_time_ms, interaction_metadata)
            VALUES ($1, 'category_match', $2, $3, $4, $5)
            RETURNING id
            """
            
            metadata = {
                'total_matches': len(matches),
                'top_confidence': matches[0].get('confidence_score', 0) if matches else 0,
                'categories_searched': len(matches),
                'match_details': [
                    {
                        'category_id': match.get('category_id'),
                        'category_name': match.get('category_name'),
                        'confidence_score': match.get('confidence_score'),
                        'similarity_score': match.get('similarity_score')
                    }
                    for match in matches[:5]  # Store top 5 matches
                ]
            }
            
            interaction = await database.fetch_one(
                interaction_query, 
                session_id, 
                user_input, 
                original_query or user_input,
                processing_time,
                json.dumps(metadata)
            )
            
            interaction_id = str(interaction['id'])
            logger.info(f"Tracked category matching interaction: {interaction_id}")
            return interaction_id
            
        except Exception as e:
            logger.error(f"Failed to track interaction: {str(e)}")
            raise HTTPException(status_code=500, detail="Interaction tracking failed")
    
    async def track_refinement(
        self,
        session_id: str,
        user_input: str,
        rejected_categories: List[int],
        new_matches: List[Dict[str, Any]],
        processing_time: int
    ) -> str:
        """Track a category refinement interaction."""
        
        if database is None:
            logger.warning("Database not available - skipping refinement tracking")
            return str(uuid.uuid4())  # Return a fake interaction ID
        
        try:
            interaction_query = """
            INSERT INTO user_interactions 
            (session_id, interaction_type, user_input, processing_time_ms, interaction_metadata)
            VALUES ($1, 'refinement', $2, $3, $4)
            RETURNING id
            """
            
            metadata = {
                'rejected_categories': rejected_categories,
                'new_matches_count': len(new_matches),
                'refinement_successful': len(new_matches) > 0,
                'new_match_details': [
                    {
                        'category_id': match.get('category_id'),
                        'category_name': match.get('category_name'),
                        'confidence_score': match.get('confidence_score')
                    }
                    for match in new_matches[:3]
                ]
            }
            
            interaction = await database.fetch_one(
                interaction_query,
                session_id,
                user_input,
                processing_time,
                json.dumps(metadata)
            )
            
            interaction_id = str(interaction['id'])
            logger.info(f"Tracked refinement interaction: {interaction_id}")
            return interaction_id
            
        except Exception as e:
            logger.error(f"Failed to track refinement: {str(e)}")
            raise HTTPException(status_code=500, detail="Refinement tracking failed")


class FeedbackCollector:
    """Collects and processes user feedback on category matches."""
    
    async def submit_feedback(
        self,
        interaction_id: str,
        category_feedbacks: List[Dict[str, Any]],
        user_rating: Optional[int] = None
    ) -> Dict[str, Any]:
        """Submit user feedback for category matches."""
        
        if database is None:
            logger.warning("Database not available - skipping feedback submission")
            return {"status": "skipped", "message": "Database not available"}
        
        try:
            # Verify interaction exists
            interaction = await self._get_interaction(interaction_id)
            if not interaction:
                raise HTTPException(status_code=404, detail="Interaction not found")
            
            feedback_records = []
            
            for feedback in category_feedbacks:
                # Get original match data from interaction metadata
                match_data = await self._get_match_data_from_interaction(
                    interaction_id, 
                    feedback['category_id']
                )
                
                # Store feedback
                feedback_record = await self._store_category_feedback(
                    interaction_id=interaction_id,
                    category_feedback=feedback,
                    match_data=match_data,
                    overall_satisfaction=overall_satisfaction,
                    additional_comments=additional_comments
                )
                
                feedback_records.append(feedback_record)
            
            # Update category performance metrics
            await self._update_category_metrics(category_feedbacks)
            
            # Log successful feedback submission
            logger.info(f"Feedback submitted for interaction {interaction_id}: {len(feedback_records)} items")
            
            return {
                "status": "success",
                "feedback_count": len(feedback_records),
                "interaction_id": interaction_id,
                "feedback_ids": [str(record['id']) for record in feedback_records]
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Feedback submission failed: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to submit feedback")
    
    async def _get_interaction(self, interaction_id: str) -> Optional[Dict[str, Any]]:
        """Get interaction details by ID."""
        if database is None:
            return None
            
        query = """
        SELECT id, session_id, interaction_type, user_input, interaction_metadata
        FROM user_interactions 
        WHERE id = $1
        """
        return await database.fetch_one(query, interaction_id)
    
    async def _get_match_data_from_interaction(
        self, 
        interaction_id: str, 
        category_id: int
    ) -> Dict[str, Any]:
        """Extract match data for specific category from interaction metadata."""
        interaction = await self._get_interaction(interaction_id)
        
        if not interaction or not interaction['interaction_metadata']:
            return {}
        
        metadata = json.loads(interaction['interaction_metadata'])
        match_details = metadata.get('match_details', [])
        
        # Find the specific category match
        for match in match_details:
            if match.get('category_id') == category_id:
                return match
        
        return {}
    
    async def _store_category_feedback(
        self,
        interaction_id: str,
        category_feedback: Dict[str, Any],
        match_data: Dict[str, Any],
        overall_satisfaction: Optional[int],
        additional_comments: Optional[str]
    ) -> Dict[str, Any]:
        """Store individual category feedback."""
        
        feedback_query = """
        INSERT INTO category_feedback 
        (interaction_id, category_id, category_name, feedback_type, 
         confidence_score, similarity_score, user_rating, feedback_reason, feedback_metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, created_at
        """
        
        feedback_metadata = {
            'overall_satisfaction': overall_satisfaction,
            'has_comments': bool(additional_comments),
            'additional_comments': additional_comments,
            'original_confidence': match_data.get('confidence_score'),
            'original_similarity': match_data.get('similarity_score'),
            'match_rank': self._get_match_rank(match_data, category_feedback['category_id'])
        }
        
        return await database.fetch_one(
            feedback_query,
            interaction_id,
            category_feedback['category_id'],
            match_data.get('category_name', 'Unknown'),
            category_feedback['feedback_type'],
            match_data.get('confidence_score'),
            match_data.get('similarity_score'),
            category_feedback.get('user_rating'),
            category_feedback.get('feedback_reason'),
            json.dumps(feedback_metadata)
        )
    
    def _get_match_rank(self, match_data: Dict[str, Any], category_id: int) -> int:
        """Determine the rank of this category in the original matches."""
        # This would need to be enhanced to track actual ranking
        return 1  # Placeholder
    
    async def _update_category_metrics(self, feedbacks: List[Dict[str, Any]]):
        """Update category performance based on feedback."""
        
        for feedback in feedbacks:
            category_id = feedback['category_id']
            
            # Calculate new success rate for the category
            success_query = """
            WITH feedback_stats AS (
                SELECT 
                    category_id,
                    COUNT(*) as total_feedback,
                    COUNT(*) FILTER (WHERE feedback_type IN ('accept', 'maybe')) as positive_feedback,
                    AVG(user_rating) as avg_rating
                FROM category_feedback 
                WHERE category_id = $1 
                AND created_at > NOW() - INTERVAL '30 days'
                GROUP BY category_id
            )
            SELECT total_feedback, positive_feedback, avg_rating
            FROM feedback_stats
            """
            
            stats = await database.fetch_one(success_query, category_id)
            
            if stats and stats['total_feedback'] > 0:
                success_rate = stats['positive_feedback'] / stats['total_feedback']
                
                # Store daily metric
                await self._store_daily_metric(
                    category_id=category_id,
                    metric_type='success_rate',
                    metric_value=success_rate,
                    sample_size=stats['total_feedback']
                )
                
                # Store user satisfaction metric
                if stats['avg_rating']:
                    await self._store_daily_metric(
                        category_id=category_id,
                        metric_type='user_satisfaction',
                        metric_value=float(stats['avg_rating']),
                        sample_size=stats['total_feedback']
                    )
    
    async def _store_daily_metric(
        self,
        category_id: int,
        metric_type: str,
        metric_value: float,
        sample_size: int
    ):
        """Store or update daily metric for a category."""
        
        metric_query = """
        INSERT INTO learning_metrics 
        (category_id, metric_type, metric_value, sample_size, time_period, calculated_at)
        VALUES ($1, $2, $3, $4, 'daily', NOW())
        ON CONFLICT (category_id, metric_type, DATE(calculated_at))
        DO UPDATE SET 
            metric_value = $3,
            sample_size = $4,
            calculated_at = NOW()
        """
        
        await database.execute(
            metric_query,
            category_id,
            metric_type,
            metric_value,
            sample_size
        )


class FeedbackAnalytics:
    """Analytics and insights from feedback data."""
    
    async def get_category_performance_summary(self, days: int = 30) -> List[Dict[str, Any]]:
        """Get category performance summary."""
        
        if database is None:
            logger.warning("Database not available - returning empty performance summary")
            return []
        
        query = """
        SELECT * FROM category_performance_summary
        WHERE total_feedback > 0
        ORDER BY acceptance_rate DESC, total_feedback DESC
        """
        
        results = await database.fetch_all(query)
        return [dict(row) for row in results]
    
    async def get_feedback_trends(self, days: int = 30) -> List[Dict[str, Any]]:
        """Get daily feedback trends."""
        
        if database is None:
            logger.warning("Database not available - returning empty feedback trends")
            return []
        
        query = """
        SELECT * FROM daily_feedback_trends
        WHERE feedback_date > NOW() - INTERVAL '%s days'
        ORDER BY feedback_date DESC
        """ % days
        
        results = await database.fetch_all(query)
        return [dict(row) for row in results]
    
    async def get_session_activity(self, days: int = 30) -> List[Dict[str, Any]]:
        """Get session activity summary."""
        
        query = """
        SELECT * FROM session_activity_summary
        WHERE session_date > NOW() - INTERVAL '%s days'
        ORDER BY session_date DESC
        """ % days
        
        results = await database.fetch_all(query)
        return [dict(row) for row in results]
    
    async def get_learning_insights(self) -> Dict[str, Any]:
        """Generate learning insights from feedback data."""
        
        # Top performing categories
        top_performers = await database.fetch_all("""
            SELECT category_name, acceptance_rate, total_feedback
            FROM category_performance_summary
            WHERE total_feedback >= 5
            ORDER BY acceptance_rate DESC
            LIMIT 5
        """)
        
        # Categories needing attention
        needs_attention = await database.fetch_all("""
            SELECT category_name, acceptance_rate, total_feedback
            FROM category_performance_summary
            WHERE acceptance_rate < 50 AND total_feedback >= 5
            ORDER BY total_feedback DESC
            LIMIT 5
        """)
        
        # Overall system metrics
        overall_stats = await database.fetch_one("""
            SELECT 
                COUNT(DISTINCT us.session_id) as total_sessions,
                COUNT(ui.id) as total_interactions,
                COUNT(cf.id) as total_feedback,
                AVG(cf.user_rating) as avg_user_rating,
                COUNT(*) FILTER (WHERE cf.feedback_type = 'accept') as total_accepts
            FROM user_sessions us
            LEFT JOIN user_interactions ui ON us.session_id = ui.session_id
            LEFT JOIN category_feedback cf ON ui.id = cf.interaction_id
            WHERE us.created_at > NOW() - INTERVAL '30 days'
        """)
        
        return {
            "top_performers": [dict(row) for row in top_performers],
            "needs_attention": [dict(row) for row in needs_attention],
            "overall_stats": dict(overall_stats) if overall_stats else {},
            "insights": self._generate_insights(top_performers, needs_attention, overall_stats)
        }
    
    def _generate_insights(self, top_performers, needs_attention, overall_stats) -> List[str]:
        """Generate actionable insights from the data."""
        insights = []
        
        if overall_stats and overall_stats['avg_user_rating']:
            rating = float(overall_stats['avg_user_rating'])
            if rating >= 4.0:
                insights.append("🎉 Users are highly satisfied with category matches (avg rating: {:.1f}/5)".format(rating))
            elif rating >= 3.0:
                insights.append("👍 User satisfaction is good but has room for improvement (avg rating: {:.1f}/5)".format(rating))
            else:
                insights.append("⚠️ User satisfaction is low - review category matching algorithm (avg rating: {:.1f}/5)".format(rating))
        
        if len(top_performers) > 0:
            best_category = top_performers[0]
            insights.append(f"🏆 '{best_category['category_name']}' is your best performing category ({best_category['acceptance_rate']:.1f}% acceptance)")
        
        if len(needs_attention) > 0:
            worst_category = needs_attention[0]
            insights.append(f"🔧 '{worst_category['category_name']}' needs attention ({worst_category['acceptance_rate']:.1f}% acceptance)")
        
        return insights


# Service instances
feedback_collector = FeedbackCollector()
interaction_tracker = InteractionTracker()
feedback_analytics = FeedbackAnalytics()


def get_feedback_collector() -> FeedbackCollector:
    """Get feedback collector instance."""
    return feedback_collector


def get_interaction_tracker() -> InteractionTracker:
    """Get interaction tracker instance."""
    return interaction_tracker


def get_feedback_analytics() -> FeedbackAnalytics:
    """Get feedback analytics instance."""
    return feedback_analytics
