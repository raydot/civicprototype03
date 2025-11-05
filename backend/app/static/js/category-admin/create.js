/**
 * Create Module - Category creation functionality
 */

import { state } from './state.js';
import { generateCategoryPreview, createCategory } from './api.js';
import { showToast, switchTab } from './ui.js';
import { loadCategories } from './browse.js';

/**
 * Generate category preview from description
 */
export async function generatePreview() {
  const description = document.getElementById('description').value.trim();

  if (!description) {
    showToast('Please describe the category you want to create', 'error');
    return;
  }

  document.getElementById('loading').style.display = 'block';
  document.getElementById('preview').style.display = 'none';
  document.getElementById('successMessage').style.display = 'none';

  try {
    state.currentPreview = await generateCategoryPreview(description);
    displayPreview(state.currentPreview);
  } catch (error) {
    showToast('Error: ' + error.message, 'error');
    console.error('Error generating preview:', error);
  } finally {
    document.getElementById('loading').style.display = 'none';
  }
}

/**
 * Display preview with editable form
 */
function displayPreview(preview) {
  // Display warnings first
  const warningsDiv = document.getElementById('warnings');
  if (preview.similarity_warnings && preview.similarity_warnings.length > 0) {
    warningsDiv.innerHTML = preview.similarity_warnings
      .map(
        (w) =>
          `<div class="warning">
                <span class="warning-icon">⚠️</span>
                <strong>Warning:</strong> ${w.message}
                <br><small>Recommendation: ${w.recommendation}</small>
            </div>`
      )
      .join('');
  } else {
    warningsDiv.innerHTML = '';
  }

  // Generate editable form HTML
  const previewCard = document.querySelector('#preview .preview-card');
  previewCard.classList.add('editable');

  previewCard.innerHTML = `
    <div class="form-field">
      <label for="edit-name">Category Name *</label>
      <input type="text" id="edit-name" value="${preview.name}" />
      <div class="error-text">Category name is required</div>
    </div>

    <div class="form-field">
      <label for="edit-description">Description *</label>
      <textarea id="edit-description" rows="3">${preview.description}</textarea>
      <div class="error-text">Description is required</div>
    </div>

    <div class="form-field">
      <label for="edit-type">Type *</label>
      <select id="edit-type">
        <option value="issue" ${preview.type === 'issue' ? 'selected' : ''}>Issue</option>
        <option value="policy" ${preview.type === 'policy' ? 'selected' : ''}>Policy</option>
      </select>
    </div>

    <div class="form-field">
      <label for="edit-spectrum">Political Spectrum *</label>
      <select id="edit-spectrum">
        <option value="progressive" ${preview.political_spectrum === 'progressive' ? 'selected' : ''}>Progressive</option>
        <option value="leans_left" ${preview.political_spectrum === 'leans_left' ? 'selected' : ''}>Leans Left</option>
        <option value="bipartisan" ${preview.political_spectrum === 'bipartisan' ? 'selected' : ''}>Bipartisan</option>
        <option value="leans_right" ${preview.political_spectrum === 'leans_right' ? 'selected' : ''}>Leans Right</option>
        <option value="conservative" ${preview.political_spectrum === 'conservative' ? 'selected' : ''}>Conservative</option>
      </select>
    </div>

    <div class="form-field">
      <label for="edit-policy-areas">Policy Areas *</label>
      <textarea id="edit-policy-areas" rows="2">${preview.policy_areas.join(', ')}</textarea>
      <div class="helper-text">Comma-separated values (e.g., healthcare, economy, education)</div>
      <div class="error-text">Policy areas must be comma-separated values</div>
    </div>

    <div class="form-field">
      <label>Keywords * (minimum 3)</label>
      <div class="editable-keywords" id="edit-keywords">
        ${preview.keywords
          .map(
            (k) => `
          <span class="keyword-tag-editable">
            ${k}
            <span class="remove-keyword" onclick="window.removePreviewKeyword('${k.replace(/'/g, "\\'")}')">×</span>
          </span>
        `
          )
          .join('')}
        <input type="text" class="keyword-input-field" id="keyword-input" placeholder="Add keyword..." onkeypress="window.handleKeywordInput(event)" />
      </div>
      <div class="helper-text">Press Enter to add a keyword</div>
      <div class="error-text">At least 3 keywords are required</div>
    </div>

    <div class="actions">
      <div class="button-group">
        <button class="btn-success" onclick="window.approveCategory()">
          ✓ Approve & Save Category
        </button>
        <button class="btn-secondary" onclick="window.resetForm()">
          ✗ Cancel
        </button>
      </div>
    </div>
  `;

  document.getElementById('preview').style.display = 'block';
  document.getElementById('preview').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Remove keyword from preview
 */
export function removePreviewKeyword(keyword) {
  const keywordsContainer = document.getElementById('edit-keywords');
  const tags = keywordsContainer.querySelectorAll('.keyword-tag-editable');

  tags.forEach((tag) => {
    if (tag.textContent.trim().replace('×', '').trim() === keyword) {
      tag.remove();
    }
  });
}

/**
 * Handle keyword input (Enter key)
 */
export function handleKeywordInput(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    const input = event.target;
    const keyword = input.value.trim();

    if (keyword) {
      // Add new keyword tag before the input
      const tag = document.createElement('span');
      tag.className = 'keyword-tag-editable';
      tag.innerHTML = `
        ${keyword}
        <span class="remove-keyword" onclick="window.removePreviewKeyword('${keyword.replace(/'/g, "\\'")}')">×</span>
      `;
      input.parentElement.insertBefore(tag, input);
      input.value = '';
    }
  }
}

/**
 * Approve and create category
 */
export async function approveCategory() {
  if (!state.currentPreview) return;

  const btn = event.target;

  // Read form values
  const name = document.getElementById('edit-name').value.trim();
  const description = document.getElementById('edit-description').value.trim();
  const type = document.getElementById('edit-type').value;
  const spectrum = document.getElementById('edit-spectrum').value;
  const policyAreasText = document.getElementById('edit-policy-areas').value.trim();

  // Get keywords from tags
  const keywordTags = document.querySelectorAll('#edit-keywords .keyword-tag-editable');
  const keywords = Array.from(keywordTags).map((tag) =>
    tag.textContent.trim().replace('×', '').trim()
  );

  // Validate
  let hasError = false;

  // Clear previous errors
  document.querySelectorAll('.form-field').forEach((field) => {
    field.classList.remove('has-error');
  });

  if (!name) {
    document.querySelector('#edit-name').closest('.form-field').classList.add('has-error');
    hasError = true;
  }

  if (!description) {
    document.querySelector('#edit-description').closest('.form-field').classList.add('has-error');
    hasError = true;
  }

  if (keywords.length < 3) {
    document.querySelector('#edit-keywords').closest('.form-field').classList.add('has-error');
    hasError = true;
  }

  // Parse policy areas as CSV
  const policyAreas = policyAreasText
    .split(',')
    .map((area) => area.trim())
    .filter((area) => area.length > 0);

  if (policyAreas.length === 0) {
    document.querySelector('#edit-policy-areas').closest('.form-field').classList.add('has-error');
    hasError = true;
  }

  if (hasError) {
    showToast('Please fix the validation errors', 'error');
    return;
  }

  // Update currentPreview with edited values
  state.currentPreview.name = name;
  state.currentPreview.description = description;
  state.currentPreview.type = type;
  state.currentPreview.political_spectrum = spectrum;
  state.currentPreview.policy_areas = policyAreas;
  state.currentPreview.keywords = keywords;

  btn.disabled = true;
  btn.textContent = 'Saving...';

  try {
    const result = await createCategory(state.currentPreview);

    document.getElementById('successText').textContent = 
      `Category "${state.currentPreview.name}" created with ID ${result.category_id}`;
    document.getElementById('successMessage').style.display = 'block';

    // Reload categories in browse tab
    await loadCategories();

    setTimeout(() => {
      resetForm();
      switchTab('browse');
    }, 2000);
  } catch (error) {
    showToast('Error saving category: ' + error.message, 'error');
    console.error('Error creating category:', error);
    btn.disabled = false;
    btn.textContent = '✓ Approve & Save Category';
  }
}

/**
 * Reset create form
 */
export function resetForm() {
  document.getElementById('description').value = '';
  document.getElementById('preview').style.display = 'none';
  document.getElementById('successMessage').style.display = 'none';

  // Remove editable class from preview card
  const previewCard = document.querySelector('#preview .preview-card');
  if (previewCard) {
    previewCard.classList.remove('editable');
  }

  state.currentPreview = null;
}

// Make functions available globally for inline event handlers
window.generatePreview = generatePreview;
window.removePreviewKeyword = removePreviewKeyword;
window.handleKeywordInput = handleKeywordInput;
window.approveCategory = approveCategory;
window.resetForm = resetForm;
