/**
 * State Module - Global application state
 */

export const state = {
  currentPreview: null,
  allCategories: [],
  filteredCategories: [],
  editingCategory: null,
  currentTransformData: null,
  currentTransformSourceId: null,
  categoryToDelete: null,
  DEBUG: false
};

export const SORT_PREFERENCE_KEY = 'categoryAdminSortPreference';
