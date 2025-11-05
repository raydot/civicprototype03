/**
 * Delete Module - Category deletion functionality
 */

import { state } from './state.js';
import { deleteCategory as deleteCategoryAPI } from './api.js';
import { showToast } from './ui.js';
import { loadCategories } from './browse.js';

/**
 * Show delete confirmation modal
 */
export function deleteCategory(id, event) {
  event.stopPropagation();

  const category = state.allCategories.find((c) => c.id === id);
  if (!category) return;

  // Store the category to delete and show modal
  state.categoryToDelete = category;
  document.getElementById('deleteCategoryName').textContent = `"${category.name}"`;
  document.getElementById('deleteModal').classList.add('active');
}

/**
 * Close delete confirmation modal
 */
export function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('active');
  state.categoryToDelete = null;
}

/**
 * Confirm and execute category deletion
 */
export async function confirmDelete() {
  if (!state.categoryToDelete) return;

  const categoryId = state.categoryToDelete.id;
  const categoryName = state.categoryToDelete.name;

  // Close modal immediately
  closeDeleteModal();

  try {
    await deleteCategoryAPI(categoryId);
    showToast(`Category "${categoryName}" deleted successfully`, 'success');

    // Reload categories to update the list and stats
    await loadCategories();
  } catch (error) {
    console.error('Error deleting category:', error);
    showToast('Failed to delete category: ' + error.message, 'error');
  }
}

// Make functions available globally for inline event handlers
window.deleteCategory = deleteCategory;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;
