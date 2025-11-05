/**
 * Edit Module - Keyword editing functionality
 */

import { state } from './state.js';
import { updateKeywords } from './api.js';
import { showToast } from './ui.js';

/**
 * Edit keywords inline
 */
export function editKeywords(id, event) {
  event.stopPropagation();

  if (state.editingCategory === id) {
    saveKeywords(id);
    return;
  }

  state.editingCategory = id;
  renderKeywordsInEditMode(id);

  // Change button text
  event.target.textContent = '💾 Save Keywords';
}

/**
 * Render keywords in edit mode
 */
function renderKeywordsInEditMode(id) {
  const category = state.allCategories.find((c) => c.id === id);
  const container = document.getElementById(`keywords-${id}`);

  container.innerHTML =
    category.keywords
      .map(
        (kw, idx) =>
          `<span class="keyword-tag editing">
            ${kw}
            <span class="keyword-remove" onclick="window.removeKeyword(${id}, ${idx}, event)">×</span>
        </span>`
      )
      .join('') +
    `<input type="text" class="keyword-input" id="new-keyword-${id}"
        placeholder="Add keyword...">`;

  // Attach event listener to the input field
  setTimeout(() => {
    const input = document.getElementById(`new-keyword-${id}`);
    if (input) {
      input.focus();
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addKeyword(id, e);
        }
      });
    }
  }, 0);
}

/**
 * Remove a keyword
 */
export async function removeKeyword(catId, kwIdx, event) {
  event.stopPropagation();
  const category = state.allCategories.find((c) => c.id === catId);
  category.keywords.splice(kwIdx, 1);
  renderKeywordsInEditMode(catId);
  // Auto-save after removing
  await saveKeywordsQuietly(catId);
}

/**
 * Add a keyword
 */
export async function addKeyword(catId, event) {
  event.stopPropagation();
  const input = document.getElementById(`new-keyword-${catId}`);
  const keyword = input.value.trim();

  if (keyword) {
    const category = state.allCategories.find((c) => c.id === catId);
    category.keywords.push(keyword);
    input.value = '';
    renderKeywordsInEditMode(catId);
    // Auto-save after adding
    await saveKeywordsQuietly(catId);
  }
}

/**
 * Save keywords
 */
export async function saveKeywords(id) {
  const category = state.allCategories.find((c) => c.id === id);

  // Check if there's text in the input field and add it first
  const input = document.getElementById(`new-keyword-${id}`);
  if (input) {
    const keyword = input.value.trim();
    if (keyword) {
      category.keywords.push(keyword);
      input.value = '';
    }
  }

  try {
    await updateKeywords(id, category.keywords);

    // Stay in edit mode and keep category expanded
    showToast('Keywords saved successfully!', 'success');
    // Re-render the keywords in edit mode without triggering save again
    renderKeywordsInEditMode(id);
  } catch (error) {
    console.error('Error saving keywords:', error);
    showToast('Failed to save keywords: ' + error.message, 'error');
  }
}

/**
 * Save keywords without showing alert (for auto-save)
 */
async function saveKeywordsQuietly(id) {
  const category = state.allCategories.find((c) => c.id === id);

  try {
    await updateKeywords(id, category.keywords);
    // Silent save - no toast
  } catch (error) {
    console.error('Error auto-saving keywords:', error);
    // Show error only if save fails
    showToast('Failed to auto-save keywords: ' + error.message, 'error');
  }
}

// Make functions available globally for inline event handlers
window.editKeywords = editKeywords;
window.removeKeyword = removeKeyword;
window.addKeyword = addKeyword;
