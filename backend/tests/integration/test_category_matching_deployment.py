"""
Integration tests for category matching - deployment gate.

These tests validate that the AI category matching system works correctly
with real-world queries before allowing deployment to production.

All 10 tests must pass for deployment to proceed.
"""

import pytest
from httpx import AsyncClient
from app.main import app


@pytest.mark.asyncio
class TestCategoryMatchingDeploymentGate:
    """
    10 real-world queries that must work correctly before deployment.
    Each test validates a different aspect of the matching system.
    """

    @pytest.fixture
    async def client(self):
        """Create async test client."""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            yield ac

    async def test_1_healthcare_access_query(self, client):
        """Test: Healthcare access query should match Healthcare category."""
        response = await client.post(
            "/api/category-matching/find-matches",
            json={
                "user_input": "I'm worried about the rising cost of healthcare and whether my family can afford insurance",
                "top_k": 3
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should return matches
        assert len(data["matches"]) > 0
        
        # Top match should be Healthcare related
        top_match = data["matches"][0]
        assert "healthcare" in top_match["name"].lower() or "health" in top_match["name"].lower()
        
        # Should have reasonable confidence
        assert top_match["confidence_score"] > 0.1

    async def test_2_climate_urgency_query(self, client):
        """Test: Climate urgency should match Climate/Environment category."""
        response = await client.post(
            "/api/category-matching/find-matches",
            json={
                "user_input": "Climate change is an existential threat and we need immediate action on renewable energy",
                "top_k": 3
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["matches"]) > 0
        top_match = data["matches"][0]
        
        # Should match climate or environment category
        category_name_lower = top_match["name"].lower()
        assert any(term in category_name_lower for term in ["climate", "environment", "energy"])

    async def test_3_education_funding_query(self, client):
        """Test: Education funding should match Education category."""
        response = await client.post(
            "/api/category-matching/find-matches",
            json={
                "user_input": "We need to increase funding for public schools and make college more affordable",
                "top_k": 3
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["matches"]) > 0
        top_match = data["matches"][0]
        assert "education" in top_match["name"].lower()

    async def test_4_immigration_reform_query(self, client):
        """Test: Immigration reform should match Immigration category."""
        response = await client.post(
            "/api/category-matching/find-matches",
            json={
                "user_input": "We need comprehensive immigration reform with a pathway to citizenship for dreamers",
                "top_k": 3
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["matches"]) > 0
        top_match = data["matches"][0]
        assert "immigration" in top_match["name"].lower()

    async def test_5_gun_safety_query(self, client):
        """Test: Gun safety should match Gun Rights/Control category."""
        response = await client.post(
            "/api/category-matching/find-matches",
            json={
                "user_input": "I support universal background checks and red flag laws to prevent gun violence",
                "top_k": 3
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["matches"]) > 0
        top_match = data["matches"][0]
        category_name_lower = top_match["name"].lower()
        assert any(term in category_name_lower for term in ["gun", "firearm", "second amendment"])

    async def test_6_economic_inequality_query(self, client):
        """Test: Economic inequality should match Economic/Tax category."""
        response = await client.post(
            "/api/category-matching/find-matches",
            json={
                "user_input": "The wealth gap is too large - we need progressive taxation and higher minimum wage",
                "top_k": 3
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["matches"]) > 0
        top_match = data["matches"][0]
        category_name_lower = top_match["name"].lower()
        assert any(term in category_name_lower for term in ["economic", "tax", "wealth", "income", "wage"])

    async def test_7_voting_rights_query(self, client):
        """Test: Voting rights should match Voting/Democracy category."""
        response = await client.post(
            "/api/category-matching/find-matches",
            json={
                "user_input": "Protecting voting rights and making it easier to vote is crucial for democracy",
                "top_k": 3
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["matches"]) > 0
        top_match = data["matches"][0]
        category_name_lower = top_match["name"].lower()
        assert any(term in category_name_lower for term in ["voting", "election", "democracy"])

    async def test_8_criminal_justice_reform_query(self, client):
        """Test: Criminal justice reform should match appropriate category."""
        response = await client.post(
            "/api/category-matching/find-matches",
            json={
                "user_input": "We need to end mass incarceration and reform our broken criminal justice system",
                "top_k": 3
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["matches"]) > 0
        top_match = data["matches"][0]
        category_name_lower = top_match["name"].lower()
        assert any(term in category_name_lower for term in ["criminal", "justice", "police", "law enforcement"])

    async def test_9_abortion_rights_query(self, client):
        """Test: Abortion rights should match Reproductive Rights category."""
        response = await client.post(
            "/api/category-matching/find-matches",
            json={
                "user_input": "I believe in protecting reproductive freedom and access to abortion services",
                "top_k": 3
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["matches"]) > 0
        top_match = data["matches"][0]
        category_name_lower = top_match["name"].lower()
        assert any(term in category_name_lower for term in ["reproductive", "abortion", "women", "choice"])

    async def test_10_infrastructure_investment_query(self, client):
        """Test: Infrastructure should match Infrastructure category."""
        response = await client.post(
            "/api/category-matching/find-matches",
            json={
                "user_input": "We need major investment in roads, bridges, and public transportation infrastructure",
                "top_k": 3
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["matches"]) > 0
        top_match = data["matches"][0]
        category_name_lower = top_match["name"].lower()
        assert any(term in category_name_lower for term in ["infrastructure", "transportation", "public works"])

    async def test_confidence_labels_are_updated(self, client):
        """Test: Verify new confidence labels are being used."""
        response = await client.post(
            "/api/category-matching/find-matches",
            json={
                "user_input": "Healthcare is my top priority",
                "top_k": 1
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["matches"]) > 0
        top_match = data["matches"][0]
        
        # Should use new labels: "Strong Match", "Good Match", "Moderate Match"
        # NOT old labels: "High Confidence", "Medium Confidence", "Low Confidence"
        confidence_label = top_match.get("confidence_label", "")
        assert confidence_label in ["Strong Match", "Good Match", "Moderate Match", "Low Confidence"]
        assert confidence_label not in ["High Confidence", "Medium Confidence"]

    async def test_response_time_acceptable(self, client):
        """Test: Response time should be under 5 seconds."""
        import time
        
        start = time.time()
        response = await client.post(
            "/api/category-matching/find-matches",
            json={
                "user_input": "I care about healthcare and education",
                "top_k": 3
            }
        )
        elapsed = time.time() - start
        
        assert response.status_code == 200
        assert elapsed < 5.0, f"Response took {elapsed:.2f}s, should be under 5s"

    async def test_multiple_priorities_query(self, client):
        """Test: Query with multiple priorities should return diverse matches."""
        response = await client.post(
            "/api/category-matching/find-matches",
            json={
                "user_input": "I care about healthcare access, climate change, and education funding equally",
                "top_k": 5
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should return multiple matches
        assert len(data["matches"]) >= 3
        
        # Should have diverse categories (not all the same)
        category_names = [match["name"] for match in data["matches"]]
        unique_categories = set(category_names)
        assert len(unique_categories) >= 2, "Should match multiple different categories"
