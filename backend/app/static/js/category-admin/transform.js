/**
 * Transform Module - Category transformation (split/merge) functionality
 */

import { state } from './state.js';
import { generateTransform as generateTransformAPI, approveTransform as approveTransformAPI } from './api.js';
import { showToast } from './ui.js';
import { loadCategories } from './browse.js';

/**
 * Show transform modal for a category
 */
export function showTransformModal(categoryId, event) {
  event.stopPropagation();
  state.currentTransformSourceId = categoryId;

  // Find and display the source category
  const category = state.allCategories.find((c) => c.id === categoryId);
  if (category) {
    document.getElementById('sourceCategoryName').textContent = category.name;
    document.getElementById('sourceCategoryDescription').textContent = category.description;
  }

  document.getElementById('transformModal').classList.add('active');
  document.getElementById('transformStep1').style.display = 'block';
  document.getElementById('transformStep2').style.display = 'none';
  document.getElementById('transformInstructions').value = '';
}

/**
 * Close transform modal
 */
export function closeTransformModal() {
  document.getElementById('transformModal').classList.remove('active');
  state.currentTransformData = null;
  state.currentTransformSourceId = null;
}

/**
 * Go back to step 1 of transform
 */
export function backToTransformStep1() {
  document.getElementById('transformStep1').style.display = 'block';
  document.getElementById('transformStep2').style.display = 'none';
}

/**
 * Generate transform preview
 */
export async function generateTransform() {
  const instructions = document.getElementById('transformInstructions').value.trim();

  if (!instructions) {
    showToast('Please provide transformation instructions', 'error');
    return;
  }

  const loadingEl = document.getElementById('transformLoading');
  loadingEl.style.display = 'block';

  try {
    state.currentTransformData = await generateTransformAPI(
      instructions,
      [state.currentTransformSourceId]
    );
    displayTransformPreview(state.currentTransformData);
  } catch (error) {
    showToast('Error: ' + error.message, 'error');
    console.error('Error generating transform:', error);
  } finally {
    loadingEl.style.display = 'none';
  }
}

/**
 * Display transform preview
 */
function displayTransformPreview(data) {
  // Show warnings if any
  const warningsDiv = document.getElementById('transformWarnings');
  if (data.similarity_warnings && data.similarity_warnings.length > 0) {
    warningsDiv.innerHTML = data.similarity_warnings
      .map(
        (w) =>
          `<div class="warning">
            <span class="warning-icon">⚠️</span>
            <strong>${w.category_name}:</strong> ${w.message}
            ${
              w.similar_to
                ? `<br><small>Similar to: ${w.similar_to.join(', ')}</small>`
                : ''
            }
          </div>`
      )
      .join('');
  } else {
    warningsDiv.innerHTML = '';
  }

  // Display category cards
  const cardsDiv = document.getElementById('transformPreviewCards');
  cardsDiv.innerHTML = data.new_categories
    .map((cat, idx) => createTransformCard(cat, idx))
    .join('');

  // Show step 2
  document.getElementById('transformStep1').style.display = 'none';
  document.getElementById('transformStep2').style.display = 'block';
}

/**
 * Create transform card HTML
 */
function createTransformCard(cat, idx) {
  return `
    <div class="transform-card" id="transform-card-${idx}">
      <div class="transform-card-header" onclick="window.toggleTransformCard(${idx})">
        <div class="transform-card-title">${cat.name}</div>
        <div class="expand-icon">▼</div>
      </div>
      <div class="transform-card-body">
        <div class="editable-field">
          <label>Name</label>
          <input type="text" id="transform-name-${idx}" value="${cat.name}" />
        </div>
        <div class="editable-field">
          <label>Description</label>
          <textarea rows="3" id="transform-desc-${idx}">${cat.description}</textarea>
        </div>
        <div class="editable-field">
          <label>Type</label>
          <select id="transform-type-${idx}">
            <option value="issue" ${cat.type === 'issue' ? 'selected' : ''}>Issue</option>
            <option value="policy" ${cat.type === 'policy' ? 'selected' : ''}>Policy</option>
          </select>
        </div>
        <div class="editable-field">
          <label>Political Spectrum</label>
          <select id="transform-spectrum-${idx}">
            <option value="progressive" ${cat.political_spectrum === 'progressive' ? 'selected' : ''}>Progressive</option>
            <option value="leans_left" ${cat.political_spectrum === 'leans_left' ? 'selected' : ''}>Leans Left</option>
            <option value="bipartisan" ${cat.political_spectrum === 'bipartisan' ? 'selected' : ''}>Bipartisan</option>
            <option value="leans_right" ${cat.political_spectrum === 'leans_right' ? 'selected' : ''}>Leans Right</option>
            <option value="conservative" ${cat.political_spectrum === 'conservative' ? 'selected' : ''}>Conservative</option>
          </select>
        </div>
        <div class="editable-field">
          <label>Keywords (${cat.keywords.length})</label>
          <div class="keywords">
            ${cat.keywords.map((k) => `<span class="keyword">${k}</span>`).join('')}
          </div>
        </div>
        ${
          cat.keyword_source_notes
            ? `<p style="color: #666; font-size: 13px; margin-top: 10px;"><em>Note: ${cat.keyword_source_notes}</em></p>`
            : ''
        }
      </div>
    </div>
  `;
}

/**
 * Toggle transform card expansion
 */
export function toggleTransformCard(idx) {
  const card = document.getElementById(`transform-card-${idx}`);
  card.classList.toggle('expanded');
}

/**
 * Approve and execute transform
 */
export async function approveTransform() {
  if (!state.currentTransformData) return;

  // Collect edited data from form fields
  const editedCategories = state.currentTransformData.new_categories.map((cat, idx) => ({
    name: document.getElementById(`transform-name-${idx}`).value,
    description: document.getElementById(`transform-desc-${idx}`).value,
    type: document.getElementById(`transform-type-${idx}`).value,
    political_spectrum: document.getElementById(`transform-spectrum-${idx}`).value,
    keywords: cat.keywords, // Keywords aren't editable in this UI (could add later)
    policy_areas: cat.policy_areas
  }));

  try {
    const result = await approveTransformAPI(
      editedCategories,
      state.currentTransformData.source_category_ids
    );

    showToast(
      `Successfully created ${result.created_category_ids.length} new categories!`,
      'success'
    );

    // Reload categories and close modal
    await loadCategories();
    closeTransformModal();
  } catch (error) {
    showToast('Error approving transform: ' + error.message, 'error');
    console.error('Error approving transform:', error);
  }
}

// Make functions available globally for inline event handlers
window.showTransformModal = showTransformModal;
window.closeTransformModal = closeTransformModal;
window.backToTransformStep1 = backToTransformStep1;
window.generateTransform = generateTransform;
window.toggleTransformCard = toggleTransformCard;
window.approveTransform = approveTransform;
