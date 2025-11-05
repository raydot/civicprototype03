/**
 * Browse Module - Category listing, filtering, and display
 */

import { state, SORT_PREFERENCE_KEY } from './state.js';
import { fetchCategories } from './api.js';
import { showToast } from './ui.js';

/**
 * Load all categories with optional sorting
 */
export async function loadCategories(sortBy = null, sortOrder = null) {
  const loadingEl = document.getElementById('loadingCategories');
  const listEl = document.getElementById('categoriesList');

  if (loadingEl) loadingEl.style.display = 'block';

  try {
    // Get sort parameters from dropdown if not provided
    if (!sortBy || !sortOrder) {
      const sortFilter = document.getElementById('sortFilter');
      if (sortFilter) {
        const sortValue = sortFilter.value;
        const [field, order] = sortValue.split('_');
        sortBy = field;
        sortOrder = order;
      } else {
        // Default to newest first
        sortBy = 'created_at';
        sortOrder = 'desc';
      }
    }

    const data = await fetchCategories(sortBy, sortOrder);

    state.allCategories = data.categories;
    state.filteredCategories = state.allCategories;

    if (state.DEBUG) {
      console.log('Loaded categories:', data);
      console.log('Total categories:', data.total);
    }

    updateStats();
    renderCategories();
  } catch (error) {
    console.error('Error loading categories:', error);
    if (listEl) {
      listEl.innerHTML =
        '<div class="no-results">Failed to load categories. Please refresh the page.</div>';
    }
  } finally {
    const loadingElFinal = document.getElementById('loadingCategories');
    if (loadingElFinal) loadingElFinal.style.display = 'none';
  }
}

/**
 * Handle sort change
 */
export function handleSortChange() {
  const sortFilter = document.getElementById('sortFilter');
  const sortValue = sortFilter.value;

  // Save preference to localStorage
  localStorage.setItem(SORT_PREFERENCE_KEY, sortValue);

  // Reload categories with new sort
  loadCategories();
}

/**
 * Update stats bar
 */
function updateStats() {
  const issueCount = state.filteredCategories.filter((c) => c.type === 'issue').length;
  const policyCount = state.filteredCategories.filter((c) => c.type === 'policy').length;

  document.getElementById('totalCategories').textContent = state.filteredCategories.length;
  document.getElementById('issueCount').textContent = issueCount;
  document.getElementById('policyCount').textContent = policyCount;
}

/**
 * Filter categories
 */
export function filterCategories() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const typeFilter = document.getElementById('typeFilter').value;
  const spectrumFilter = document.getElementById('spectrumFilter').value;

  state.filteredCategories = state.allCategories.filter((cat) => {
    const matchesSearch =
      !searchTerm ||
      cat.name.toLowerCase().includes(searchTerm) ||
      cat.description.toLowerCase().includes(searchTerm);

    const matchesType = !typeFilter || cat.type === typeFilter;

    const matchesSpectrum =
      !spectrumFilter || cat.metadata?.political_spectrum === spectrumFilter;

    return matchesSearch && matchesType && matchesSpectrum;
  });

  updateStats();
  renderCategories();
}

/**
 * Render category cards
 */
function renderCategories() {
  const container = document.getElementById('categoriesList');

  if (state.filteredCategories.length === 0) {
    container.innerHTML =
      '<div class="no-results">No categories found matching your filters.</div>';
    return;
  }

  container.innerHTML = state.filteredCategories
    .map((cat) => createCategoryCard(cat))
    .join('');
}

/**
 * Create category card HTML
 */
function createCategoryCard(cat) {
  const spectrum = cat.metadata?.political_spectrum || 'bipartisan';
  const spectrumPosition = getSpectrumPosition(spectrum);

  return `
        <div class="category-card" data-id="${cat.id}">
            <div class="category-header" onclick="window.toggleCategory(${cat.id})">
                <div class="category-info">
                    <div class="category-title">
                        <span>${cat.name}</span>
                        <span class="category-id">id: ${cat.id}</span>
                    </div>
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
                            <span>Leans Left</span>
                            <span>Bipartisan</span>
                            <span>Leans Right</span>
                            <span>Conservative</span>
                        </div>
                    </div>
                </div>
                <div class="expand-icon">▼</div>
            </div>
            <div class="category-details">
                <div class="category-description">${cat.description}</div>

                <div class="keywords-section">
                    <div class="section-header">
                        <div class="section-title">Keywords (${cat.keywords?.length || 0})</div>
                    </div>
                    <div class="keywords-container" id="keywords-${cat.id}">
                        ${(cat.keywords || [])
                          .map((kw) => `<span class="keyword-tag">${kw}</span>`)
                          .join('')}
                    </div>
                </div>

                <div class="action-buttons">
                    <button class="btn-small btn-edit" onclick="window.editKeywords(${cat.id}, event)">
                        ✏️ Edit Keywords
                    </button>
                    <button class="btn-small btn-enhance" onclick="window.showEnhanceForm(${cat.id}, event)">
                        ✨ Enhance with AI
                    </button>
                    <button class="btn-small btn-transform" onclick="window.showTransformModal(${cat.id}, event)">
                        🔀 Transform Category
                    </button>
                    <button class="btn-small btn-delete" onclick="window.deleteCategory(${cat.id}, event)">
                        🗑️ Delete
                    </button>
                </div>

                <div class="enhance-form" id="enhance-${cat.id}">
                    <label>What's missing? Describe the context:</label>
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
    `;
}

/**
 * Get temperature bar position (0-100%)
 */
function getSpectrumPosition(spectrum) {
  const positions = {
    progressive: 0,
    leans_left: 25,
    bipartisan: 50,
    leans_right: 75,
    conservative: 100,
    // Legacy mappings for backward compatibility
    liberal: 0,
    polarized: 50
  };
  return positions[spectrum] || 50;
}

/**
 * Toggle category expansion
 */
export function toggleCategory(id) {
  const card = document.querySelector(`.category-card[data-id="${id}"]`);
  card.classList.toggle('expanded');
}

// Make functions available globally for inline event handlers
window.toggleCategory = toggleCategory;
window.handleSortChange = handleSortChange;
window.filterCategories = filterCategories;
