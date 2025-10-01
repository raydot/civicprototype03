"""
Phase 1: Database Operations Tests (pytest version)

Professional test suite for database parameter fixes and interaction tracking.
Tests all database operations with named parameters and graceful degradation.
"""
import pytest
import json
from app.db.database import database
from app.services.feedback_service import UserSession, InteractionTracker, FeedbackCollector


@pytest.mark.asyncio
@pytest.mark.database
class TestDatabaseOperations:
    """Test suite for Phase 1 database operations"""
    
    async def test_database_connection(self, db_connection):
        """Test 1: Database connection with named parameters"""
        result = await db_connection.fetch_one("SELECT 1 as test")
        assert result is not None
        assert result['test'] == 1
    
    async def test_session_creation(self, db_connection, test_session_data):
        """Test 2: Session creation with named parameters"""
        query = """
        INSERT INTO user_sessions (session_id, user_ip, user_agent, last_activity)
        VALUES (:session_id, :user_ip, :user_agent, NOW())
        ON CONFLICT (session_id) 
        DO UPDATE SET 
            last_activity = NOW(),
            total_interactions = user_sessions.total_interactions + 1
        RETURNING id, session_id
        """
        
        result = await db_connection.fetch_one(query, test_session_data)
        
        assert result is not None
        assert result['session_id'] == test_session_data['session_id']
        
        # Verify we can retrieve it
        verify_query = "SELECT * FROM user_sessions WHERE session_id = :session_id"
        session = await db_connection.fetch_one(
            verify_query, 
            {"session_id": test_session_data['session_id']}
        )
        assert session is not None
        assert session['user_ip'] == test_session_data['user_ip']
    
    async def test_interaction_tracking(self, db_connection, test_session_data, test_interaction_data):
        """Test 3: Interaction tracking with named parameters"""
        # First create a session
        session_query = """
        INSERT INTO user_sessions (session_id, user_ip, user_agent, last_activity)
        VALUES (:session_id, :user_ip, :user_agent, NOW())
        ON CONFLICT (session_id) DO NOTHING
        """
        await db_connection.execute(session_query, test_session_data)
        
        # Now track interaction
        interaction_query = """
        INSERT INTO user_interactions 
        (session_id, interaction_type, user_input, original_query, processing_time_ms, interaction_metadata)
        VALUES (:session_id, 'category_matching', :user_input, :original_query, :processing_time, :metadata)
        RETURNING id
        """
        
        metadata = {
            'matches_count': len(test_interaction_data['matches']),
            'top_match': test_interaction_data['matches'][0]
        }
        
        result = await db_connection.fetch_one(
            interaction_query,
            {
                "session_id": test_session_data['session_id'],
                "user_input": test_interaction_data['user_input'],
                "original_query": test_interaction_data['user_input'],
                "processing_time": test_interaction_data['processing_time'],
                "metadata": json.dumps(metadata)
            }
        )
        
        assert result is not None
        assert 'id' in result
        
        # Verify we can retrieve it
        verify_query = "SELECT * FROM user_interactions WHERE id = :id"
        interaction = await db_connection.fetch_one(verify_query, {"id": result['id']})
        assert interaction is not None
        assert interaction['user_input'] == test_interaction_data['user_input']
    
    async def test_feedback_submission(self, db_connection, test_session_data, test_interaction_data, test_feedback_data):
        """Test 4: Feedback submission with named parameters"""
        # Create session and interaction first
        session_query = """
        INSERT INTO user_sessions (session_id, user_ip, user_agent, last_activity)
        VALUES (:session_id, :user_ip, :user_agent, NOW())
        ON CONFLICT (session_id) DO NOTHING
        """
        await db_connection.execute(session_query, test_session_data)
        
        interaction_query = """
        INSERT INTO user_interactions 
        (session_id, interaction_type, user_input, processing_time_ms, interaction_metadata)
        VALUES (:session_id, 'category_matching', :user_input, :processing_time, :metadata)
        RETURNING id
        """
        
        interaction = await db_connection.fetch_one(
            interaction_query,
            {
                "session_id": test_session_data['session_id'],
                "user_input": test_interaction_data['user_input'],
                "processing_time": test_interaction_data['processing_time'],
                "metadata": json.dumps({'test': True})
            }
        )
        
        # Submit feedback
        feedback_query = """
        INSERT INTO category_feedback 
        (interaction_id, category_id, category_name, feedback_type, 
         confidence_score, similarity_score, user_rating, feedback_reason, feedback_metadata)
        VALUES (:interaction_id, :category_id, :category_name, :feedback_type, 
         :confidence_score, :similarity_score, :user_rating, :feedback_reason, :feedback_metadata)
        RETURNING id, created_at
        """
        
        result = await db_connection.fetch_one(
            feedback_query,
            {
                "interaction_id": interaction['id'],
                **test_feedback_data,
                "feedback_metadata": json.dumps({"test": True})
            }
        )
        
        assert result is not None
        assert 'id' in result
        assert 'created_at' in result
    
    async def test_analytics_query(self, db_connection):
        """Test 5: Analytics queries with named parameters"""
        query = """
        WITH feedback_stats AS (
            SELECT 
                category_id,
                COUNT(*) as total_feedback,
                COUNT(*) FILTER (WHERE feedback_type IN ('accept', 'maybe')) as positive_feedback,
                AVG(user_rating) as avg_rating
            FROM category_feedback 
            WHERE category_id = :category_id 
            AND created_at > NOW() - INTERVAL '30 days'
            GROUP BY category_id
        )
        SELECT total_feedback, positive_feedback, avg_rating
        FROM feedback_stats
        """
        
        # This might return None if no data, which is fine
        result = await db_connection.fetch_one(query, {"category_id": 1})
        
        # Just verify the query executes without error
        assert True  # If we got here, query succeeded


@pytest.mark.asyncio
@pytest.mark.integration
class TestFeedbackServices:
    """Integration tests for feedback service classes"""
    
    async def test_user_session_service(self, db_connection, mock_request):
        """Test UserSession service with real database"""
        user_session = UserSession(mock_request)
        session_id = await user_session.create_or_update_session()
        
        assert session_id is not None
        assert len(session_id) > 0
        
        # Verify session was created in database
        query = "SELECT * FROM user_sessions WHERE session_id = :session_id"
        result = await db_connection.fetch_one(query, {"session_id": session_id})
        assert result is not None
        assert result['user_ip'] == "127.0.0.1"
    
    async def test_interaction_tracker_service(self, db_connection, mock_request, test_interaction_data):
        """Test InteractionTracker service with real database"""
        # Create session first
        user_session = UserSession(mock_request)
        session_id = await user_session.create_or_update_session()
        
        # Track interaction
        tracker = InteractionTracker()
        interaction_id = await tracker.track_category_matching(
            session_id=session_id,
            user_input=test_interaction_data['user_input'],
            matches=test_interaction_data['matches'],
            processing_time=test_interaction_data['processing_time']
        )
        
        assert interaction_id is not None
        
        # Verify interaction was created
        query = "SELECT * FROM user_interactions WHERE id = :id"
        result = await db_connection.fetch_one(query, {"id": interaction_id})
        assert result is not None
        assert result['user_input'] == test_interaction_data['user_input']
    
    async def test_full_workflow(self, db_connection, mock_request, test_interaction_data):
        """Test complete workflow: Session → Interaction → Feedback"""
        # Step 1: Create session
        user_session = UserSession(mock_request)
        session_id = await user_session.create_or_update_session()
        assert session_id is not None
        
        # Step 2: Track interaction
        tracker = InteractionTracker()
        interaction_id = await tracker.track_category_matching(
            session_id=session_id,
            user_input=test_interaction_data['user_input'],
            matches=test_interaction_data['matches'],
            processing_time=test_interaction_data['processing_time']
        )
        assert interaction_id is not None
        
        # Step 3: Submit feedback
        collector = FeedbackCollector()
        feedback_result = await collector.submit_feedback(
            interaction_id=interaction_id,
            category_feedbacks=[{
                'category_id': 1,
                'category_name': 'Climate & Environment',
                'feedback_type': 'accept',
                'user_rating': 5,
                'feedback_reason': 'Very relevant'
            }],
            user_rating=5,
            overall_satisfaction=5,
            additional_comments="Great match!"
        )
        
        assert feedback_result is not None
        assert 'status' in feedback_result
        assert feedback_result['status'] == 'success'
        assert 'feedback_count' in feedback_result
        assert feedback_result['feedback_count'] > 0


@pytest.mark.asyncio
@pytest.mark.unit
class TestGracefulDegradation:
    """Test graceful degradation when database is unavailable"""
    
    async def test_session_without_database(self, mock_request, monkeypatch):
        """Test UserSession handles missing database gracefully"""
        # Mock database as None
        monkeypatch.setattr('app.services.feedback_service.database', None)
        
        user_session = UserSession(mock_request)
        session_id = await user_session.create_or_update_session()
        
        # Should return a session ID even without database
        assert session_id is not None
        assert len(session_id) > 0
    
    async def test_interaction_tracking_without_database(self, test_interaction_data, monkeypatch):
        """Test InteractionTracker handles missing database gracefully"""
        # Mock database as None
        monkeypatch.setattr('app.services.feedback_service.database', None)
        
        tracker = InteractionTracker()
        interaction_id = await tracker.track_category_matching(
            session_id="test-session",
            user_input=test_interaction_data['user_input'],
            matches=test_interaction_data['matches'],
            processing_time=test_interaction_data['processing_time']
        )
        
        # Should return an interaction ID even without database
        assert interaction_id is not None
        assert len(interaction_id) > 0
