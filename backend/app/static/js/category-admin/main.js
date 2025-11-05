/**
 * Main Entry Point - Category Admin Application
 * 
 * This module initializes the application and wires up all functionality.
 * It imports from specialized modules to keep code organized and maintainable.
 */

import { state, SORT_PREFERENCE_KEY } from './state.js';
import { showToast, switchTab } from './ui.js';
import { loadCategories, handleSortChange, filterCategories, toggleCategory } from './browse.js';
import { editKeywords, removeKeyword, addKeyword } from './edit.js';
import { showEnhanceForm, hideEnhanceForm, enhanceCategory } from './enhance.js';
import { generatePreview, approveCategory, resetForm, removePreviewKeyword, handleKeywordInput } from './create.js';
import { showTransformModal, closeTransformModal, generateTransform, approveTransform, backToTransformStep1, toggleTransformCard } from './transform.js';
import { deleteCategory, confirmDelete, closeDeleteModal } from './delete.js';

/**
 * Initialize application on page load
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('Category Admin initializing...');

  // Restore sort preference from localStorage
  const savedSort = localStorage.getItem(SORT_PREFERENCE_KEY);
  if (savedSort) {
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
      sortFilter.value = savedSort;
    }
  }

  // Load categories
  loadCategories();

  // Add keyboard shortcut for create tab
  const descriptionEl = document.getElementById('description');
  if (descriptionEl) {
    descriptionEl.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        generatePreview();
      }
    });
  }

  console.log('Category Admin initialized successfully');
});

/**
 * Export state for debugging (development only)
 */
if (state.DEBUG) {
  window.categoryAdminState = state;
}

// Export main functions to window for inline event handlers
// (This maintains backward compatibility with existing HTML)
// Note: Individual modules also export their functions to window,
// but we centralize them here for clarity

// Browse module
window.loadCategories = loadCategories;
window.handleSortChange = handleSortChange;
window.filterCategories = filterCategories;
window.toggleCategory = toggleCategory;

// Edit module
window.editKeywords = editKeywords;
window.removeKeyword = removeKeyword;
window.addKeyword = addKeyword;

// Enhance module
window.showEnhanceForm = showEnhanceForm;
window.hideEnhanceForm = hideEnhanceForm;
window.enhanceCategory = enhanceCategory;

// Create module
window.generatePreview = generatePreview;
window.approveCategory = approveCategory;
window.resetForm = resetForm;
window.removePreviewKeyword = removePreviewKeyword;
window.handleKeywordInput = handleKeywordInput;

// Transform module
window.showTransformModal = showTransformModal;
window.closeTransformModal = closeTransformModal;
window.backToTransformStep1 = backToTransformStep1;
window.generateTransform = generateTransform;
window.toggleTransformCard = toggleTransformCard;
window.approveTransform = approveTransform;

// Delete module
window.deleteCategory = deleteCategory;
window.confirmDelete = confirmDelete;
window.closeDeleteModal = closeDeleteModal;

// UI module
window.showToast = showToast;
window.switchTab = switchTab;
