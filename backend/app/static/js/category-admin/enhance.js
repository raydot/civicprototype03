/**
 * Enhance Module - AI keyword enhancement functionality
 */

import { enhanceCategory as enhanceCategoryAPI } from './api.js';
import { showToast } from './ui.js';
import { loadCategories } from './browse.js';

/**
 * Show enhance form for a category
 */
export function showEnhanceForm(id, event) {
  event.stopPropagation();
  document.getElementById(`enhance-${id}`).classList.add('active');
}

/**
 * Hide enhance form for a category
 */
export function hideEnhanceForm(id, event) {
  event.stopPropagation();
  document.getElementById(`enhance-${id}`).classList.remove('active');
}

/**
 * Enhance category with AI-generated keywords
 */
export async function enhanceCategory(id, event) {
  event.stopPropagation();

  const context = document.getElementById(`enhance-context-${id}`).value.trim();
  if (!context) {
    showToast('Please describe what keywords are missing', 'error');
    return;
  }

  const btn = event.target;
  btn.disabled = true;
  btn.textContent = 'Generating...';

  try {
    const result = await enhanceCategoryAPI(id, context);

    showToast(
      `Added ${result.added_keywords.length} new keywords: ${result.added_keywords.join(', ')}`,
      'success'
    );

    // Reload categories
    await loadCategories();
    hideEnhanceForm(id, event);
  } catch (error) {
    console.error('Error enhancing category:', error);
    showToast('Failed to enhance category: ' + error.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Generate Keywords';
  }
}

// Make functions available globally for inline event handlers
window.showEnhanceForm = showEnhanceForm;
window.hideEnhanceForm = hideEnhanceForm;
window.enhanceCategory = enhanceCategory;
