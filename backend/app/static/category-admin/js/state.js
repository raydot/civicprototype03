/**
 * Application state management
 * Single source of truth for all data
 */

export const state = {
  // Browse tab state
  allCategories: [],
  filteredCategories: [],
  editingCategory: null,
  
  // Create tab state
  currentPreview: null,
  
  // Config
  DEBUG: false
}

/**
 * Update all categories and reset filters
 */
export function setCategories(categories) {
  state.allCategories = categories
  state.filteredCategories = categories
}

/**
 * Update filtered categories
 */
export function setFilteredCategories(categories) {
  state.filteredCategories = categories
}

/**
 * Get category by ID
 */
export function getCategoryById(id) {
  return state.allCategories.find(c => c.id === id)
}

/**
 * Update category in state
 */
export function updateCategory(id, updates) {
  const category = getCategoryById(id)
  if (category) {
    Object.assign(category, updates)
  }
}

/**
 * Set current preview for create flow
 */
export function setCurrentPreview(preview) {
  state.currentPreview = preview
}

/**
 * Set editing category ID
 */
export function setEditingCategory(id) {
  state.editingCategory = id
}

/**
 * Clear editing state
 */
export function clearEditingCategory() {
  state.editingCategory = null
}
