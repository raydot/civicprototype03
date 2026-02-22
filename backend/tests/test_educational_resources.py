"""
Tests for educational resources API endpoints
"""
import pytest
from httpx import AsyncClient
from app.main import app


@pytest.mark.asyncio
class TestEducationalResourcesEndpoints:
    """Test educational resources CRUD operations"""
    
    async def test_get_categories(self):
        """Test fetching all categories"""
        async with AsyncClient(app=app, base_url="http://testserver") as client:
            response = await client.get("/educational-resources/categories")
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)
            # Should have at least some categories
            assert len(data) > 0
            # Check structure of first category
            if data:
                category = data[0]
                assert "id" in category
                assert "name" in category
                assert "type" in category
    
    async def test_get_category_by_id(self):
        """Test fetching a specific category with resources"""
        async with AsyncClient(app=app, base_url="http://testserver") as client:
            # First get all categories to find a valid ID
            categories_response = await client.get("/educational-resources/categories")
            categories = categories_response.json()
            
            if categories:
                category_id = categories[0]["id"]
                
                # Now fetch that specific category
                response = await client.get(f"/educational-resources/category/{category_id}")
                assert response.status_code == 200
                data = response.json()
                assert data["id"] == category_id
                assert "name" in data
                assert "type" in data
                assert "resources" in data
                assert isinstance(data["resources"], list)
    
    async def test_get_nonexistent_category(self):
        """Test fetching a category that doesn't exist"""
        async with AsyncClient(app=app, base_url="http://testserver") as client:
            response = await client.get("/educational-resources/category/99999")
            assert response.status_code == 404
    
    async def test_create_resource_unauthorized(self):
        """Test creating a resource without authentication"""
        async with AsyncClient(app=app, base_url="http://testserver") as client:
            resource_data = {
                "category_id": 1,
                "title": "Test Resource",
                "type": "article",
                "url": "https://example.com/test",
                "source": "Test Source",
                "description": "Test description"
            }
            response = await client.post("/educational-resources/resources", json=resource_data)
            assert response.status_code == 401  # Unauthorized
    
    async def test_create_resource_with_auth(self):
        """Test creating a resource with authentication"""
        async with AsyncClient(app=app, base_url="http://testserver") as client:
            # Get valid category ID first
            categories_response = await client.get("/educational-resources/categories")
            categories = categories_response.json()
            
            if categories:
                category_id = categories[0]["id"]
                
                resource_data = {
                    "category_id": category_id,
                    "title": "Test Resource",
                    "type": "article",
                    "url": "https://example.com/test",
                    "source": "Test Source",
                    "description": "Test description",
                    "duration": "10 min",
                    "display_order": 1
                }
                
                # Use HTTP Basic Auth
                response = await client.post(
                    "/educational-resources/resources",
                    json=resource_data,
                    auth=("T0pS33k5", "VPVPrim32025!bana7")
                )
                
                # Should succeed with auth
                assert response.status_code in [200, 201]
                data = response.json()
                assert data["title"] == "Test Resource"
                assert data["category_id"] == category_id
                
                # Clean up - delete the test resource
                resource_id = data["id"]
                await client.delete(
                    f"/educational-resources/resources/{resource_id}",
                    auth=("T0pS33k5", "VPVPrim32025!bana7")
                )
    
    async def test_update_resource(self):
        """Test updating a resource"""
        async with AsyncClient(app=app, base_url="http://testserver") as client:
            # First create a resource
            categories_response = await client.get("/educational-resources/categories")
            categories = categories_response.json()
            
            if categories:
                category_id = categories[0]["id"]
                
                # Create
                create_data = {
                    "category_id": category_id,
                    "title": "Original Title",
                    "type": "article",
                    "url": "https://example.com/original",
                    "source": "Test Source"
                }
                create_response = await client.post(
                    "/educational-resources/resources",
                    json=create_data,
                    auth=("T0pS33k5", "VPVPrim32025!bana7")
                )
                assert create_response.status_code in [200, 201]
                resource_id = create_response.json()["id"]
                
                # Update
                update_data = {
                    "title": "Updated Title",
                    "description": "Updated description"
                }
                update_response = await client.put(
                    f"/educational-resources/resources/{resource_id}",
                    json=update_data,
                    auth=("T0pS33k5", "VPVPrim32025!bana7")
                )
                assert update_response.status_code == 200
                updated = update_response.json()
                assert updated["title"] == "Updated Title"
                assert updated["description"] == "Updated description"
                
                # Clean up
                await client.delete(
                    f"/educational-resources/resources/{resource_id}",
                    auth=("T0pS33k5", "VPVPrim32025!bana7")
                )
    
    async def test_delete_resource(self):
        """Test deleting a resource"""
        async with AsyncClient(app=app, base_url="http://testserver") as client:
            # First create a resource
            categories_response = await client.get("/educational-resources/categories")
            categories = categories_response.json()
            
            if categories:
                category_id = categories[0]["id"]
                
                # Create
                create_data = {
                    "category_id": category_id,
                    "title": "To Be Deleted",
                    "type": "article",
                    "url": "https://example.com/delete",
                    "source": "Test Source"
                }
                create_response = await client.post(
                    "/educational-resources/resources",
                    json=create_data,
                    auth=("T0pS33k5", "VPVPrim32025!bana7")
                )
                resource_id = create_response.json()["id"]
                
                # Delete
                delete_response = await client.delete(
                    f"/educational-resources/resources/{resource_id}",
                    auth=("T0pS33k5", "VPVPrim32025!bana7")
                )
                assert delete_response.status_code == 200
                
                # Verify it's gone - category should no longer have this resource
                category_response = await client.get(f"/educational-resources/category/{category_id}")
                category_data = category_response.json()
                resource_ids = [r["id"] for r in category_data["resources"]]
                assert resource_id not in resource_ids
    
    async def test_invalid_resource_type(self):
        """Test creating a resource with invalid type"""
        async with AsyncClient(app=app, base_url="http://testserver") as client:
            categories_response = await client.get("/educational-resources/categories")
            categories = categories_response.json()
            
            if categories:
                category_id = categories[0]["id"]
                
                invalid_data = {
                    "category_id": category_id,
                    "title": "Test",
                    "type": "invalid_type",  # Should be article, video, podcast, or lesson
                    "url": "https://example.com/test",
                    "source": "Test"
                }
                
                response = await client.post(
                    "/educational-resources/resources",
                    json=invalid_data,
                    auth=("T0pS33k5", "VPVPrim32025!bana7")
                )
                assert response.status_code == 422  # Validation error
    
    async def test_resource_ordering(self):
        """Test that resources are returned in display_order"""
        async with AsyncClient(app=app, base_url="http://testserver") as client:
            categories_response = await client.get("/educational-resources/categories")
            categories = categories_response.json()
            
            if categories:
                category_id = categories[0]["id"]
                
                # Create multiple resources with different display orders
                resources_to_create = [
                    {"title": "Third", "display_order": 3},
                    {"title": "First", "display_order": 1},
                    {"title": "Second", "display_order": 2}
                ]
                
                created_ids = []
                for res_data in resources_to_create:
                    full_data = {
                        "category_id": category_id,
                        "title": res_data["title"],
                        "type": "article",
                        "url": f"https://example.com/{res_data['title'].lower()}",
                        "source": "Test",
                        "display_order": res_data["display_order"]
                    }
                    response = await client.post(
                        "/educational-resources/resources",
                        json=full_data,
                        auth=("T0pS33k5", "VPVPrim32025!bana7")
                    )
                    if response.status_code in [200, 201]:
                        created_ids.append(response.json()["id"])
                
                # Fetch category and check order
                category_response = await client.get(f"/educational-resources/category/{category_id}")
                category_data = category_response.json()
                
                # Find our test resources
                test_resources = [r for r in category_data["resources"] if r["id"] in created_ids]
                if len(test_resources) == 3:
                    assert test_resources[0]["title"] == "First"
                    assert test_resources[1]["title"] == "Second"
                    assert test_resources[2]["title"] == "Third"
                
                # Clean up
                for resource_id in created_ids:
                    await client.delete(
                        f"/educational-resources/resources/{resource_id}",
                        auth=("T0pS33k5", "VPVPrim32025!bana7")
                    )
