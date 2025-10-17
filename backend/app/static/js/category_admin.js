// Category Admin JavaScript

// Global state
let currentPreview = null
let allCategories = []
let filteredCategories = []
let editingCategory = null
let currentTransformData = null
let currentTransformSourceId = null
const API_BASE = window.location.origin
const DEBUG = false

// Toast notification system
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer')
  const toast = document.createElement('div')
  toast.className = `toast ${type}`
  
  const icon = type === 'success' ? '✓' : '✕'
  
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `
  
  container.appendChild(toast)
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('removing')
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadCategories()
  
  // Add keyboard shortcut for create tab
  const descriptionEl = document.getElementById('description')
  if (descriptionEl) {
    descriptionEl.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        generatePreview()
      }
    })
  }
})

// Tab switching
function switchTab(tabName, event) {
  // Update tab buttons
  document
    .querySelectorAll('.tab')
    .forEach((tab) => tab.classList.remove('active'))
  
  // If event is provided, highlight the clicked tab
  if (event && event.target) {
    event.target.classList.add('active')
  } else {
    // If no event (programmatic call), find and activate the correct tab button
    const tabs = document.querySelectorAll('.tab')
    tabs.forEach((tab) => {
      if (
        (tabName === 'browse' && tab.textContent.includes('Browse')) ||
        (tabName === 'create' && tab.textContent.includes('Create'))
      ) {
        tab.classList.add('active')
      }
    })
  }

  // Update tab content
  document
    .querySelectorAll('.tab-content')
    .forEach((content) => content.classList.remove('active'))

  if (tabName === 'browse') {
    document.getElementById('browseTab').classList.add('active')
  } else {
    document.getElementById('createTab').classList.add('active')
  }
}

// Load all categories
async function loadCategories() {
  const loadingEl = document.getElementById('loadingCategories')
  const listEl = document.getElementById('categoriesList')

  if (loadingEl) loadingEl.style.display = 'block'

  try {
    const response = await fetch(`${API_BASE}/category-admin/categories`)
    if (!response.ok) throw new Error('Failed to load categories')

    const data = await response.json()

    allCategories = data.categories
    filteredCategories = allCategories

    if (DEBUG) {
      console.log('Loaded categories:', data)
      console.log('Total categories:', data.total)
      console.log('Categories array:', data.categories)
      console.log('allCategories:', allCategories)
      console.log('filteredCategories:', filteredCategories)
    }

    updateStats()
    renderCategories()
  } catch (error) {
    console.error('Error loading categories:', error)
    if (listEl) {
      listEl.innerHTML =
        '<div class="no-results">Failed to load categories. Please refresh the page.</div>'
    }
  } finally {
    const loadingElFinal = document.getElementById('loadingCategories')
    if (loadingElFinal) loadingElFinal.style.display = 'none'
  }
}

// Update stats bar
function updateStats() {
  const issueCount = filteredCategories.filter(
    (c) => c.type === 'issue'
  ).length
  const policyCount = filteredCategories.filter(
    (c) => c.type === 'policy'
  ).length

  document.getElementById('totalCategories').textContent =
    filteredCategories.length
  document.getElementById('issueCount').textContent = issueCount
  document.getElementById('policyCount').textContent = policyCount
}

// Filter categories
function filterCategories() {
  const searchTerm = document
    .getElementById('searchInput')
    .value.toLowerCase()
  const typeFilter = document.getElementById('typeFilter').value
  const spectrumFilter = document.getElementById('spectrumFilter').value

  filteredCategories = allCategories.filter((cat) => {
    const matchesSearch =
      !searchTerm ||
      cat.name.toLowerCase().includes(searchTerm) ||
      cat.description.toLowerCase().includes(searchTerm)

    const matchesType = !typeFilter || cat.type === typeFilter

    const matchesSpectrum =
      !spectrumFilter ||
      cat.metadata?.political_spectrum === spectrumFilter

    return matchesSearch && matchesType && matchesSpectrum
  })

  updateStats()
  renderCategories()
}

// Render category cards
function renderCategories() {
  const container = document.getElementById('categoriesList')

  if (filteredCategories.length === 0) {
    container.innerHTML =
      '<div class="no-results">No categories found matching your filters.</div>'
    return
  }

  container.innerHTML = filteredCategories
    .map((cat) => createCategoryCard(cat))
    .join('')
}

// Create category card HTML
function createCategoryCard(cat) {
  const spectrum = cat.metadata?.political_spectrum || 'bipartisan'
  const spectrumPosition = getSpectrumPosition(spectrum)

  return `
        <div class="category-card" data-id="${cat.id}">
            <div class="category-header" onclick="toggleCategory(${
              cat.id
            })">
                <div class="category-info">
                    <div class="category-title">
                        <span>${cat.name}</span>
                        <span class="category-id">id: ${cat.id}</span>
                    </div>
                    <div class="category-meta">
                        <span class="badge badge-${cat.type}">${
    cat.type
  }</span>
                        <span class="keyword-count">${
                          cat.keywords?.length || 0
                        } keywords</span>
                    </div>
                    <div class="temperature-bar-container">
                        <div class="temperature-label">Political Spectrum</div>
                        <div class="temperature-bar">
                            <div class="temperature-indicator" style="left: ${spectrumPosition}%"></div>
                        </div>
                        <div class="temperature-labels">
                            <span>Liberal</span>
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
                        <div class="section-title">Keywords (${
                          cat.keywords?.length || 0
                        })</div>
                    </div>
                    <div class="keywords-container" id="keywords-${
                      cat.id
                    }">
                        ${(cat.keywords || [])
                          .map(
                            (kw) =>
                              `<span class="keyword-tag">${kw}</span>`
                          )
                          .join('')}
                    </div>
                </div>

                <div class="action-buttons">
                    <button class="btn-small btn-edit" onclick="editKeywords(${
                      cat.id
                    }, event)">
                        ✏️ Edit Keywords
                    </button>
                    <button class="btn-small btn-enhance" onclick="showEnhanceForm(${
                      cat.id
                    }, event)">
                        ✨ Enhance with AI
                    </button>
                    <button class="btn-small btn-transform" onclick="showTransformModal(${
                      cat.id
                    }, event)">
                        🔀 Transform Category
                    </button>
                </div>

                <div class="enhance-form" id="enhance-${cat.id}">
                    <label>What's missing? Describe the context:</label>
                    <textarea rows="3" id="enhance-context-${cat.id}"
                        placeholder="Example: Users are searching for 'digital divide' and 'internet access' but not matching well"></textarea>
                    <div class="button-group">
                        <button class="btn-small btn-enhance" onclick="enhanceCategory(${
                          cat.id
                        }, event)">
                            Generate Keywords
                        </button>
                        <button class="btn-small btn-cancel" onclick="hideEnhanceForm(${
                          cat.id
                        }, event)">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `
}

// Get temperature bar position (0-100%)
function getSpectrumPosition(spectrum) {
  const positions = {
    liberal: 0,
    leans_left: 25,
    bipartisan: 50,
    leans_right: 75,
    conservative: 100,
    // Legacy mappings for backward compatibility
    progressive: 0,
    polarized: 50
  }
  return positions[spectrum] || 50
}

// Toggle category expansion
function toggleCategory(id) {
  const card = document.querySelector(`.category-card[data-id="${id}"]`)
  card.classList.toggle('expanded')
}

// Edit keywords inline
function editKeywords(id, event) {
  event.stopPropagation()

  if (editingCategory === id) {
    saveKeywords(id)
    return
  }

  editingCategory = id
  const category = allCategories.find((c) => c.id === id)
  const container = document.getElementById(`keywords-${id}`)

  container.innerHTML =
    category.keywords
      .map(
        (kw, idx) =>
          `<span class="keyword-tag editing">
            ${kw}
            <span class="keyword-remove" onclick="removeKeyword(${id}, ${idx}, event)">×</span>
        </span>`
      )
      .join('') +
    `<input type="text" class="keyword-input" id="new-keyword-${id}"
        placeholder="Add keyword...">`

  // Attach event listener to the input field
  const input = document.getElementById(`new-keyword-${id}`)
  if (input) {
    input.addEventListener('keypress', async (e) => {
      if (e.key === 'Enter') {
        e.stopPropagation()
        await addKeyword(id, e)
      }
    })
  }

  event.target.textContent = '💾 Save Keywords'
}

async function removeKeyword(catId, kwIdx, event) {
  event.stopPropagation()
  const category = allCategories.find((c) => c.id === catId)
  category.keywords.splice(kwIdx, 1)
  renderKeywordsInEditMode(catId)
  // Auto-save after removing
  await saveKeywordsQuietly(catId)
}

async function addKeyword(catId, event) {
  event.stopPropagation()
  const input = document.getElementById(`new-keyword-${catId}`)
  const keyword = input.value.trim()

  if (keyword) {
    const category = allCategories.find((c) => c.id === catId)
    category.keywords.push(keyword)
    input.value = ''
    renderKeywordsInEditMode(catId)
    // Auto-save after adding
    await saveKeywordsQuietly(catId)
  }
}

async function saveKeywords(id) {
  const category = allCategories.find((c) => c.id === id)
  
  // Check if there's text in the input field and add it first
  const input = document.getElementById(`new-keyword-${id}`)
  if (input) {
    const keyword = input.value.trim()
    if (keyword) {
      category.keywords.push(keyword)
      input.value = ''
    }
  }

  try {
    const response = await fetch(
      `${API_BASE}/category-admin/categories/${id}/update-keywords`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: category.keywords })
      }
    )

    if (!response.ok) throw new Error('Failed to save keywords')

    // Stay in edit mode and keep category expanded
    showToast('Keywords saved successfully!', 'success')
    // Re-render the keywords in edit mode without triggering save again
    renderKeywordsInEditMode(id)
  } catch (error) {
    console.error('Error saving keywords:', error)
    showToast('Failed to save keywords: ' + error.message, 'error')
  }
}

// Save keywords without showing alert (for auto-save)
async function saveKeywordsQuietly(id) {
  const category = allCategories.find((c) => c.id === id)

  try {
    const response = await fetch(
      `${API_BASE}/category-admin/categories/${id}/update-keywords`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: category.keywords })
      }
    )

    if (!response.ok) throw new Error('Failed to save keywords')
    // Silent save - no toast
  } catch (error) {
    console.error('Error auto-saving keywords:', error)
    // Show error only if save fails
    showToast('Failed to auto-save keywords: ' + error.message, 'error')
  }
}

function renderKeywordsInEditMode(id) {
  const category = allCategories.find((c) => c.id === id)
  const container = document.getElementById(`keywords-${id}`)

  container.innerHTML =
    category.keywords
      .map(
        (kw, idx) =>
          `<span class="keyword-tag editing">
            ${kw}
            <span class="keyword-remove" onclick="removeKeyword(${id}, ${idx}, event)">×</span>
        </span>`
      )
      .join('') +
    `<input type="text" class="keyword-input" id="new-keyword-${id}"
        placeholder="Add keyword...">`
  
  // Attach event listener to the input field
  setTimeout(() => {
    const input = document.getElementById(`new-keyword-${id}`)
    if (input) {
      input.focus()
      input.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
          e.stopPropagation()
          await addKeyword(id, e)
        }
      })
    }
  }, 0)
}

// Show/hide enhance form
function showEnhanceForm(id, event) {
  event.stopPropagation()
  document.getElementById(`enhance-${id}`).classList.add('active')
}

function hideEnhanceForm(id, event) {
  event.stopPropagation()
  document.getElementById(`enhance-${id}`).classList.remove('active')
}

// Enhance category with AI
async function enhanceCategory(id, event) {
  event.stopPropagation()

  const context = document
    .getElementById(`enhance-context-${id}`)
    .value.trim()
  if (!context) {
    alert('Please describe what keywords are missing')
    return
  }

  const btn = event.target
  btn.disabled = true
  btn.textContent = 'Generating...'

  try {
    const response = await fetch(
      `${API_BASE}/category-admin/categories/${id}/enhance`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ additional_context: context })
      }
    )

    if (!response.ok) throw new Error('Failed to enhance category')

    const result = await response.json()

    showToast(
      `Added ${result.added_keywords.length} new keywords: ${result.added_keywords.join(', ')}`,
      'success'
    )

    // Reload categories
    await loadCategories()
    hideEnhanceForm(id, event)
  } catch (error) {
    console.error('Error enhancing category:', error)
    showToast('Failed to enhance category: ' + error.message, 'error')
  } finally {
    btn.disabled = false
    btn.textContent = 'Generate Keywords'
  }
}

// TRANSFORM CATEGORY FUNCTIONS
function showTransformModal(categoryId, event) {
  event.stopPropagation()
  currentTransformSourceId = categoryId
  
  // Find and display the source category
  const category = allCategories.find(c => c.id === categoryId)
  if (category) {
    document.getElementById('sourceCategoryName').textContent = category.name
    document.getElementById('sourceCategoryDescription').textContent = category.description
  }
  
  document.getElementById('transformModal').classList.add('active')
  document.getElementById('transformStep1').style.display = 'block'
  document.getElementById('transformStep2').style.display = 'none'
  document.getElementById('transformInstructions').value = ''
}

function closeTransformModal() {
  document.getElementById('transformModal').classList.remove('active')
  currentTransformData = null
  currentTransformSourceId = null
}

function backToTransformStep1() {
  document.getElementById('transformStep1').style.display = 'block'
  document.getElementById('transformStep2').style.display = 'none'
}

async function generateTransform() {
  const instructions = document.getElementById('transformInstructions').value.trim()
  
  if (!instructions) {
    showToast('Please provide transformation instructions', 'error')
    return
  }

  const loadingEl = document.getElementById('transformLoading')
  loadingEl.style.display = 'block'

  try {
    const response = await fetch(
      `${API_BASE}/category-admin/categories/transform`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transform_instructions: instructions,
          source_category_ids: [currentTransformSourceId]
        })
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to generate transform')
    }

    currentTransformData = await response.json()
    displayTransformPreview(currentTransformData)
  } catch (error) {
    showToast('Error: ' + error.message, 'error')
    console.error('Error generating transform:', error)
  } finally {
    loadingEl.style.display = 'none'
  }
}

function displayTransformPreview(data) {
  // Show warnings if any
  const warningsDiv = document.getElementById('transformWarnings')
  if (data.similarity_warnings && data.similarity_warnings.length > 0) {
    warningsDiv.innerHTML = data.similarity_warnings
      .map(
        (w) =>
          `<div class="warning">
            <span class="warning-icon">⚠️</span>
            <strong>${w.category_name}:</strong> ${w.message}
            ${w.similar_to ? `<br><small>Similar to: ${w.similar_to.join(', ')}</small>` : ''}
          </div>`
      )
      .join('')
  } else {
    warningsDiv.innerHTML = ''
  }

  // Display category cards
  const cardsDiv = document.getElementById('transformPreviewCards')
  cardsDiv.innerHTML = data.new_categories
    .map((cat, idx) => createTransformCard(cat, idx))
    .join('')

  // Show step 2
  document.getElementById('transformStep1').style.display = 'none'
  document.getElementById('transformStep2').style.display = 'block'
}

function createTransformCard(cat, idx) {
  return `
    <div class="transform-card" id="transform-card-${idx}">
      <div class="transform-card-header" onclick="toggleTransformCard(${idx})">
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
            <option value="liberal" ${cat.political_spectrum === 'liberal' ? 'selected' : ''}>Liberal</option>
            <option value="leans_left" ${cat.political_spectrum === 'leans_left' ? 'selected' : ''}>Leans Left</option>
            <option value="bipartisan" ${cat.political_spectrum === 'bipartisan' ? 'selected' : ''}>Bipartisan</option>
            <option value="leans_right" ${cat.political_spectrum === 'leans_right' ? 'selected' : ''}>Leans Right</option>
            <option value="conservative" ${cat.political_spectrum === 'conservative' ? 'selected' : ''}>Conservative</option>
          </select>
        </div>
        <div class="editable-field">
          <label>Keywords (${cat.keywords.length})</label>
          <div class="keywords">
            ${cat.keywords.map(k => `<span class="keyword">${k}</span>`).join('')}
          </div>
        </div>
        ${cat.keyword_source_notes ? `<p style="color: #666; font-size: 13px; margin-top: 10px;"><em>Note: ${cat.keyword_source_notes}</em></p>` : ''}
      </div>
    </div>
  `
}

function toggleTransformCard(idx) {
  const card = document.getElementById(`transform-card-${idx}`)
  card.classList.toggle('expanded')
}

async function approveTransform() {
  if (!currentTransformData) return

  // Collect edited data from form fields
  const editedCategories = currentTransformData.new_categories.map((cat, idx) => ({
    name: document.getElementById(`transform-name-${idx}`).value,
    description: document.getElementById(`transform-desc-${idx}`).value,
    type: document.getElementById(`transform-type-${idx}`).value,
    political_spectrum: document.getElementById(`transform-spectrum-${idx}`).value,
    keywords: cat.keywords, // Keywords aren't editable in this UI (could add later)
    policy_areas: cat.policy_areas
  }))

  try {
    const response = await fetch(
      `${API_BASE}/category-admin/categories/transform/approve`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          new_categories: editedCategories,
          source_category_ids: currentTransformData.source_category_ids
        })
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to approve transform')
    }

    const result = await response.json()

    showToast(
      `Successfully created ${result.created_category_ids.length} new categories!`,
      'success'
    )

    // Reload categories and close modal
    await loadCategories()
    closeTransformModal()
  } catch (error) {
    showToast('Error approving transform: ' + error.message, 'error')
    console.error('Error approving transform:', error)
  }
}

// CREATE TAB FUNCTIONS
async function generatePreview() {
  const description = document.getElementById('description').value.trim()

  if (!description) {
    showToast('Please describe the category you want to create', 'error')
    return
  }

  document.getElementById('loading').style.display = 'block'
  document.getElementById('preview').style.display = 'none'
  document.getElementById('successMessage').style.display = 'none'

  try {
    const response = await fetch(
      `${API_BASE}/category-admin/generate-preview`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to generate preview')
    }

    currentPreview = await response.json()
    displayPreview(currentPreview)
  } catch (error) {
    showToast('Error: ' + error.message, 'error')
    console.error('Error generating preview:', error)
  } finally {
    document.getElementById('loading').style.display = 'none'
  }
}

function displayPreview(preview) {
  document.getElementById('categoryName').textContent = preview.name
  document.getElementById('categoryDescription').textContent =
    preview.description
  document.getElementById('categoryType').textContent = preview.type
  document.getElementById('categorySpectrum').textContent =
    preview.political_spectrum
  document.getElementById('categoryAreas').textContent =
    preview.policy_areas.join(', ')

  const keywordsDiv = document.getElementById('keywords')
  keywordsDiv.innerHTML = preview.keywords
    .map((k) => `<span class="keyword">${k}</span>`)
    .join('')
  document.getElementById('keywordCount').textContent =
    preview.keywords.length

  const warningsDiv = document.getElementById('warnings')
  if (
    preview.similarity_warnings &&
    preview.similarity_warnings.length > 0
  ) {
    warningsDiv.innerHTML = preview.similarity_warnings
      .map(
        (w) =>
          `<div class="warning">
                <span class="warning-icon">⚠️</span>
                <strong>Warning:</strong> ${w.message}
                <br><small>Recommendation: ${w.recommendation}</small>
            </div>`
      )
      .join('')
  } else {
    warningsDiv.innerHTML = ''
  }

  document.getElementById('preview').style.display = 'block'
  document
    .getElementById('preview')
    .scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

async function approveCategory() {
  if (!currentPreview) return

  const btn = event.target
  btn.disabled = true
  btn.textContent = 'Saving...'

  try {
    const response = await fetch(
      `${API_BASE}/category-admin/create-category`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentPreview)
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to create category')
    }

    const result = await response.json()

    document.getElementById(
      'successText'
    ).textContent = `Category "${currentPreview.name}" created with ID ${result.category_id}`
    document.getElementById('successMessage').style.display = 'block'

    // Reload categories in browse tab
    await loadCategories()

    setTimeout(() => {
      resetForm()
      switchTab('browse')
    }, 2000)
  } catch (error) {
    showToast('Error saving category: ' + error.message, 'error')
    console.error('Error creating category:', error)
    btn.disabled = false
    btn.textContent = '✓ Approve & Save Category'
  }
}

function resetForm() {
  document.getElementById('description').value = ''
  document.getElementById('preview').style.display = 'none'
  document.getElementById('successMessage').style.display = 'none'
  currentPreview = null
}
