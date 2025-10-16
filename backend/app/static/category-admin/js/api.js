/**
 * API layer for Category Admin
 * All backend communication happens here
 */

import { apiRequest } from '../../shared/api-base.js'

const API_PREFIX = '/category-admin'

/**
 * Load all categories from database
 */
export async function loadCategories() {
  return apiRequest(`${API_PREFIX}/categories`)
}

/**
 * Generate AI preview for new category
 */
export async function generateCategoryPreview(description) {
  return apiRequest(`${API_PREFIX}/generate-preview`, {
    method: 'POST',
    body: JSON.stringify({ description })
  })
}

/**
 * Create new category from preview
 */
export async function createCategory(preview) {
  return apiRequest(`${API_PREFIX}/create-category`, {
    method: 'POST',
    body: JSON.stringify(preview)
  })
}

/**
 * Update keywords for existing category
 */
export async function updateCategoryKeywords(categoryId, keywords) {
  return apiRequest(`${API_PREFIX}/categories/${categoryId}/update-keywords`, {
    method: 'POST',
    body: JSON.stringify({ keywords })
  })
}

/**
 * Enhance category with AI-generated keywords
 */
export async function enhanceCategory(categoryId, additionalContext) {
  return apiRequest(`${API_PREFIX}/categories/${categoryId}/enhance`, {
    method: 'POST',
    body: JSON.stringify({ additional_context: additionalContext })
  })
}

/**
 * Delete category (soft delete)
 */
export async function deleteCategory(categoryId) {
  return apiRequest(`${API_PREFIX}/categories/${categoryId}`, {
    method: 'DELETE'
  })
}
