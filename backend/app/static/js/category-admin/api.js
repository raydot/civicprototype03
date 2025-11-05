/**
 * API Module - All API calls for category admin
 */

const API_BASE = window.location.origin;

/**
 * Handle API responses with permission checking
 */
export async function handleApiResponse(response) {
  if (response.status === 403) {
    const data = await response.json();
    window.showToast(
      data.detail || "You don't have permission to perform this action. Guest users have read-only access.",
      'error'
    );
    throw new Error('Permission denied');
  }
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response;
}

/**
 * Fetch all categories with optional sorting
 */
export async function fetchCategories(sortBy = 'created_at', sortOrder = 'desc') {
  const response = await fetch(
    `${API_BASE}/category-admin/categories?sort_by=${sortBy}&sort_order=${sortOrder}`
  );
  await handleApiResponse(response);
  return response.json();
}

/**
 * Fetch a single category by ID
 */
export async function fetchCategory(categoryId) {
  const response = await fetch(`${API_BASE}/category-admin/categories/${categoryId}`);
  await handleApiResponse(response);
  return response.json();
}

/**
 * Generate category preview from description
 */
export async function generateCategoryPreview(description) {
  const response = await fetch(`${API_BASE}/category-admin/generate-preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description })
  });
  await handleApiResponse(response);
  return response.json();
}

/**
 * Create a new category
 */
export async function createCategory(categoryData) {
  const response = await fetch(`${API_BASE}/category-admin/create-category`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoryData)
  });
  await handleApiResponse(response);
  return response.json();
}

/**
 * Update category keywords
 */
export async function updateKeywords(categoryId, keywords) {
  const response = await fetch(
    `${API_BASE}/category-admin/categories/${categoryId}/update-keywords`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords })
    }
  );
  await handleApiResponse(response);
  return response.json();
}

/**
 * Enhance category with AI-generated keywords
 */
export async function enhanceCategory(categoryId, additionalContext) {
  const response = await fetch(
    `${API_BASE}/category-admin/categories/${categoryId}/enhance`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ additional_context: additionalContext })
    }
  );
  await handleApiResponse(response);
  return response.json();
}

/**
 * Generate category transform preview
 */
export async function generateTransform(instructions, sourceCategoryIds) {
  const response = await fetch(`${API_BASE}/category-admin/categories/transform`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transform_instructions: instructions,
      source_category_ids: sourceCategoryIds
    })
  });
  await handleApiResponse(response);
  return response.json();
}

/**
 * Approve and execute category transform
 */
export async function approveTransform(newCategories, sourceCategoryIds) {
  const response = await fetch(
    `${API_BASE}/category-admin/categories/transform/approve`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        new_categories: newCategories,
        source_category_ids: sourceCategoryIds
      })
    }
  );
  await handleApiResponse(response);
  return response.json();
}

/**
 * Delete a category
 */
export async function deleteCategory(categoryId) {
  const response = await fetch(
    `${API_BASE}/category-admin/categories/${categoryId}`,
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    }
  );
  await handleApiResponse(response);
  return response.json();
}
