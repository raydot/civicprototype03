/**
 * UI rendering functions
 * Pure functions that generate HTML and update DOM
 */

import { state } from './state.js'

/**
 * Update stats bar with current counts
 */
export function updateStats() {
  const issueCount = state.filteredCategories.filter(c => c.type === 'issue').length
  const policyCount = state.filteredCategories.filter(c => c.type === 'policy').length

  document.getElementById('totalCategories').textContent = state.filteredCategories.length
  document.getElementById('issueCount').textContent = issueCount
  document.getElementById('policyCount').textContent = policyCount
}

/**
 * Render all category cards
 */
export function renderCategories() {
  const container = document.getElementById('categoriesList')

  if (state.filteredCategories.length === 0) {
    container.innerHTML = '<div class="no-results">No categories found matching your filters.</div>'
    return
  }

  container.innerHTML = state.filteredCategories
    .map(cat => createCategoryCard(cat))
    .join('')
}

/**
 * Create HTML for a single category card
 */
export function createCategoryCard(cat) {
  const spectrum = cat.metadata?.political_spectrum || 'bipartisan'
  const spectrumPosition = getSpectrumPosition(spectrum)

  return `
    <div class="category-card" data-id="${cat.id}">
      <div class="category-header" onclick="window.toggleCategory(${cat.id})">
        <div class="category-info">
          <div class="category-title">#${cat.id} ${cat.name}</div>
          <div class="category-meta">
            <span class="badge badge-${cat.type}">${cat.type}</span>
            <span class="keyword-count">${cat.keywords?.length || 0} keywords</span>
          </div>
          <div class="temperature-bar-container">
            <div class="temperature-label">Political Spectrum</div>
            <div class="temperature-bar">
              <div class="temperature-indicator" style="left: ${spectrumPosition}%"></div>
            </div>
            <div class="temperature-labels">
              <span>Progressive</span>
              <span>Moderate</span>
              <span>Conservative</span>
            </div>
          </div>
        </div>
        <div class="expand-icon">▼</div>
      </div>

      <div class="category-details">
        <div class="description-section">
          <div class="section-title">Description</div>
          <p>${cat.description}</p>
        </div>

        <div class="keywords-section">
          <div class="section-header">
            <div class="section-title">Keywords (${cat.keywords?.length || 0})</div>
          </div>
          <div class="keywords-container" id="keywords-${cat.id}">
            ${(cat.keywords || [])
              .map(kw => `<span class="keyword-tag">${kw}</span>`)
              .join('')}
          </div>
        </div>

        <div class="actions-section">
          <button class="btn-small btn-edit" onclick="window.editKeywords(${cat.id}, event)">
            ✏️ Edit Keywords
          </button>
          <button class="btn-small btn-enhance" onclick="window.showEnhanceForm(${cat.id}, event)">
            ✨ Enhance with AI
          </button>
        </div>

        <div class="enhance-form" id="enhance-${cat.id}">
          <label>Describe what keywords are missing:</label>
          <textarea rows="3" id="enhance-context-${cat.id}"
            placeholder="Example: Users are searching for 'digital divide' and 'internet access' but not matching well"></textarea>
          <div class="button-group">
            <button class="btn-small btn-enhance" onclick="window.enhanceCategory(${cat.id}, event)">
              Generate Keywords
            </button>
            <button class="btn-small btn-cancel" onclick="window.hideEnhanceForm(${cat.id}, event)">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  `
}

/**
 * Get temperature bar position (0-100%)
 */
function getSpectrumPosition(spectrum) {
  const positions = {
    progressive: 0,
    bipartisan: 50,
    polarized: 50,
    conservative: 100
  }
  return positions[spectrum] || 50
}

/**
 * Display preview for new category
 */
export function displayPreview(preview) {
  document.getElementById('categoryName').textContent = preview.name
  document.getElementById('categoryDescription').textContent = preview.description
  document.getElementById('categoryType').textContent = preview.type
  document.getElementById('categorySpectrum').textContent = preview.political_spectrum
  document.getElementById('categoryAreas').textContent = preview.policy_areas.join(', ')

  const keywordsDiv = document.getElementById('keywords')
  keywordsDiv.innerHTML = preview.keywords
    .map(k => `<span class="keyword">${k}</span>`)
    .join('')
  document.getElementById('keywordCount').textContent = preview.keywords.length

  const warningsDiv = document.getElementById('warnings')
  if (preview.similarity_warnings && preview.similarity_warnings.length > 0) {
    warningsDiv.innerHTML = preview.similarity_warnings
      .map(w => `
        <div class="warning">
          <span class="warning-icon">⚠️</span>
          <strong>Warning:</strong> ${w.message}
          <br><small>Recommendation: ${w.recommendation}</small>
        </div>
      `)
      .join('')
  } else {
    warningsDiv.innerHTML = ''
  }

  document.getElementById('preview').style.display = 'block'
  document.getElementById('preview').scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

/**
 * Show loading state
 */
export function showLoading(elementId) {
  const el = document.getElementById(elementId)
  if (el) el.style.display = 'block'
}

/**
 * Hide loading state
 */
export function hideLoading(elementId) {
  const el = document.getElementById(elementId)
  if (el) el.style.display = 'none'
}

/**
 * Show success message
 */
export function showSuccessMessage(message) {
  document.getElementById('successText').textContent = message
  document.getElementById('successMessage').style.display = 'block'
}

/**
 * Render keywords in edit mode
 */
export function renderEditableKeywords(categoryId, keywords) {
  const container = document.getElementById(`keywords-${categoryId}`)
  
  container.innerHTML = keywords
    .map((kw, idx) => `
      <span class="keyword-tag editing">
        ${kw}
        <span class="keyword-remove" onclick="window.removeKeyword(${categoryId}, ${idx}, event)">×</span>
      </span>
    `)
    .join('') +
    `<input type="text" class="keyword-input" id="new-keyword-${categoryId}"
      placeholder="Add keyword..." onkeypress="if(event.key==='Enter') window.addKeyword(${categoryId}, event)">`
}
