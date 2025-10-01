"""
Tests for Learning API endpoints

Tests the feedback learning loop functionality:
- Category performance metrics
- Underperforming category identification
- Rejection pattern analysis
- Missing category suggestions
"""
import pytest
from fastapi.testclient import TestClient


@pytest.mark.integration
@pytest.mark.skip(reason="TestClient doesn't maintain database connections - use manual testing")
class TestLearningEndpoints:
    """Integration tests for learning API endpoints - requires manual testing with live server"""
    
    def test_get_learning_insights(self, client: TestClient):
        """Test GET /learning/insights - Dashboard overview"""
        response = client.get("/learning/insights?days=30")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "period_days" in data
        assert "summary" in data
        assert "underperforming_categories" in data
        assert "rejection_patterns" in data
        assert "missing_category_suggestions" in data
        assert "recommendations" in data
        
        # Verify summary structure
        assert "underperforming_count" in data["summary"]
        assert "missing_categories_count" in data["summary"]
        assert "needs_attention" in data["summary"]
        
        print(f"✅ Learning insights returned: {data['summary']}")
    
    def test_get_underperforming_categories(self, client: TestClient):
        """Test GET /learning/underperforming-categories"""
        response = client.get(
            "/learning/underperforming-categories"
            "?success_threshold=0.5&min_samples=5&days=30"
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "success_threshold" in data
        assert "min_samples" in data
        assert "period_days" in data
        assert "count" in data
        assert "categories" in data
        
        assert data["success_threshold"] == 0.5
        assert data["min_samples"] == 5
        assert data["period_days"] == 30
        assert isinstance(data["categories"], list)
        
        print(f"✅ Found {data['count']} underperforming categories")
    
    def test_get_category_performance(self, client: TestClient):
        """Test GET /learning/category-performance/{id}"""
        # Test with category ID 1
        response = client.get("/learning/category-performance/1?days=30")
        
        # Should return 200 if data exists, or 404 if no feedback
        assert response.status_code in [200, 404]
        
        if response.status_code == 200:
            data = response.json()
            
            # Verify response structure
            assert "category_id" in data
            assert "period_days" in data
            assert "total_feedback" in data
            assert "breakdown" in data
            assert "success_rate" in data
            assert "avg_confidence" in data
            assert "rejection_reasons" in data
            assert "status" in data
            assert "recommendations" in data
            
            # Verify breakdown structure
            assert "accepts" in data["breakdown"]
            assert "rejects" in data["breakdown"]
            assert "maybes" in data["breakdown"]
            assert "irrelevant" in data["breakdown"]
            
            # Verify status is valid
            assert data["status"] in ["excellent", "good", "needs_improvement", "poor"]
            
            print(f"✅ Category 1 performance: {data['status']} (success_rate: {data['success_rate']})")
        else:
            print("ℹ️  No feedback data for category 1")
    
    def test_get_rejection_patterns(self, client: TestClient):
        """Test GET /learning/rejection-patterns"""
        response = client.get("/learning/rejection-patterns?days=30")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "period_days" in data
        assert "category_id" in data  # Should be None for all categories
        assert "rejection_patterns" in data
        
        assert data["period_days"] == 30
        assert data["category_id"] is None
        assert isinstance(data["rejection_patterns"], list)
        
        print(f"✅ Found {len(data['rejection_patterns'])} rejection patterns")
    
    def test_get_rejection_patterns_for_category(self, client: TestClient):
        """Test GET /learning/rejection-patterns with specific category"""
        response = client.get("/learning/rejection-patterns?category_id=1&days=30")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "period_days" in data
        assert "category_id" in data
        assert "rejection_patterns" in data
        
        assert data["category_id"] == 1
        assert isinstance(data["rejection_patterns"], list)
        
        print(f"✅ Found {len(data['rejection_patterns'])} rejection patterns for category 1")
    
    def test_identify_missing_categories(self, client: TestClient):
        """Test GET /learning/missing-categories"""
        response = client.get(
            "/learning/missing-categories"
            "?confidence_threshold=0.5&frequency_threshold=3&days=30"
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "confidence_threshold" in data
        assert "frequency_threshold" in data
        assert "period_days" in data
        assert "suggestions_count" in data
        assert "suggestions" in data
        
        assert data["confidence_threshold"] == 0.5
        assert data["frequency_threshold"] == 3
        assert data["period_days"] == 30
        assert isinstance(data["suggestions"], list)
        
        print(f"✅ Found {data['suggestions_count']} missing category suggestions")
    
    def test_invalid_category_id(self, client: TestClient):
        """Test with invalid category ID"""
        response = client.get("/learning/category-performance/99999?days=30")
        
        # Should return 404 for non-existent category
        assert response.status_code == 404
        
        print("✅ Correctly returns 404 for invalid category")
    
    def test_invalid_parameters(self, client: TestClient):
        """Test with invalid query parameters"""
        # Test with invalid success_threshold (> 1.0)
        response = client.get(
            "/learning/underperforming-categories?success_threshold=1.5"
        )
        
        # Should return 422 for invalid parameters
        assert response.status_code == 422
        
        print("✅ Correctly validates query parameters")


@pytest.mark.asyncio
@pytest.mark.integration
class TestLearningServiceIntegration:
    """Integration tests for learning service with database"""
    
    async def test_learning_service_with_real_data(self, db_connection):
        """Test learning service with actual database data"""
        from app.services.learning_service import get_learning_service
        
        learning_service = get_learning_service()
        
        # Test identifying underperforming categories
        underperforming = await learning_service.identify_underperforming_categories(
            success_threshold=0.5,
            min_samples=1,  # Low threshold for testing
            days=30
        )
        
        assert isinstance(underperforming, list)
        print(f"✅ Learning service found {len(underperforming)} underperforming categories")
    
    async def test_feedback_analyzer_with_real_data(self, db_connection):
        """Test feedback analyzer with actual database data"""
        from app.services.learning_service import get_feedback_analyzer
        
        analyzer = get_feedback_analyzer()
        
        # Test analyzing rejection patterns
        patterns = await analyzer.analyze_rejection_patterns(days=30)
        
        assert isinstance(patterns, dict)
        assert "rejection_patterns" in patterns
        print(f"✅ Feedback analyzer found {len(patterns['rejection_patterns'])} patterns")
