/**
 * Event handlers for user interactions
 * All onclick, onsubmit, etc. handlers
 */

import * as api from './api.js'
import { state, setCategories, setFilteredCategories, getCategoryById, updateCategory, setCurrentPreview, setEditingCategory, clearEditingCategory } from './state.js'
import { updateStats, renderCategories, displayPreview, showLoading, hideLoading, showSuccessMessage, renderEditableKeywords } from './ui.js'
import { showError, showSuccess } from '../../shared/api-base.js'

/**
 * Load all categories from API
 */
export async function loadCategories() {
  const loadingEl = document.getElementById('loadingCategories')
  const listEl = document.getElementById('categoriesList')

  if (loadingEl) loadingEl.style.display = 'block'

  try {
    const data = await api.loadCategories()
    
    setCategories(data.categories)

    if (state.DEBUG) {
      console.log('Loaded categories:', data)
      console.log('Total categories:', data.total)
    }

    updateStats()
    renderCategories()
  } catch (error) {
    console.error('Error loading categories:', error)
    if (listEl) {
      listEl.innerHTML = '<div class="no-results">Failed to load categories. Please refresh the page.</div>'
    }
  } finally {
    const loadingElFinal = document.getElementById('loadingCategories')
    if (loadingElFinal) loadingElFinal.style.display = 'none'
  }
}

/**
 * Filter categories based on search and filters
 */
export function filterCategories() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase()
  const typeFilter = document.getElementById('typeFilter').value
  const spectrumFilter = document.getElementById('spectrumFilter').value

  const filtered = state.allCategories.filter(cat => {
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

  setFilteredCategories(filtered)
  updateStats()
  renderCategories()
}

/**
 * Toggle category card expansion
 */
export function toggleCategory(id) {
  const card = document.querySelector(`.category-card[data-id="${id}"]`)
  card.classList.toggle('expanded')
}

/**
 * Edit keywords inline
 */
export function editKeywords(id, event) {
  event.stopPropagation()

  if (state.editingCategory === id) {
    saveKeywords(id)
    return
  }

  setEditingCategory(id)
  const category = getCategoryById(id)
  
  renderEditableKeywords(id, category.keywords)
  event.target.textContent = '💾 Save Keywords'
}

/**
 * Remove keyword from category
 */
export function removeKeyword(catId, kwIdx, event) {
  event.stopPropagation()
  const category = getCategoryById(catId)
  category.keywords.splice(kwIdx, 1)
  renderEditableKeywords(catId, category.keywords)
}

/**
 * Add new keyword to category
 */
export function addKeyword(catId, event) {
  event.stopPropagation()
  const input = document.getElementById(`new-keyword-${catId}`)
  const keyword = input.value.trim()

  if (keyword) {
    const category = getCategoryById(catId)
    category.keywords.push(keyword)
    input.value = ''
    renderEditableKeywords(catId, category.keywords)
  }
}

/**
 * Save keywords to database
 */
export async function saveKeywords(id) {
  const category = getCategoryById(id)

  try {
    await api.updateCategoryKeywords(id, category.keywords)
    
    clearEditingCategory()
    renderCategories()
    showSuccess('Keywords saved successfully!')
  } catch (error) {
    showError('Failed to save keywords', error)
  }
}

/**
 * Show enhance form
 */
export function showEnhanceForm(id, event) {
  event.stopPropagation()
  document.getElementById(`enhance-${id}`).classList.add('active')
}

/**
 * Hide enhance form
 */
export function hideEnhanceForm(id, event) {
  event.stopPropagation()
  document.getElementById(`enhance-${id}`).classList.remove('active')
}

/**
 * Enhance category with AI
 */
export async function enhanceCategory(id, event) {
  event.stopPropagation()

  const context = document.getElementById(`enhance-context-${id}`).value.trim()
  if (!context) {
    alert('Please describe what keywords are missing')
    return
  }

  const btn = event.target
  btn.disabled = true
  btn.textContent = 'Generating...'

  try {
    const result = await api.enhanceCategory(id, context)

    alert(`Added ${result.added_keywords.length} new keywords:\n${result.added_keywords.join(', ')}`)

    // Reload categories
    await loadCategories()
    hideEnhanceForm(id, event)
  } catch (error) {
    showError('Failed to enhance category', error)
  } finally {
    btn.disabled = false
    btn.textContent = 'Generate Keywords'
  }
}

/**
 * Generate category preview from description
 */
export async function generatePreview() {
  const description = document.getElementById('description').value.trim()

  if (!description) {
    alert('Please describe the category you want to create')
    return
  }

  showLoading('loading')
  hideLoading('preview')
  hideLoading('successMessage')

  try {
    const preview = await api.generateCategoryPreview(description)
    
    setCurrentPreview(preview)
    displayPreview(preview)
  } catch (error) {
    showError('Error generating preview', error)
  } finally {
    hideLoading('loading')
  }
}

/**
 * Approve and save category
 */
export async function approveCategory(event) {
  if (!state.currentPreview) return

  const btn = event.target
  btn.disabled = true
  btn.textContent = 'Saving...'

  try {
    const result = await api.createCategory(state.currentPreview)

    showSuccessMessage(`Category "${state.currentPreview.name}" created with ID ${result.category_id}`)

    // Reload categories in browse tab
    await loadCategories()

    setTimeout(() => {
      resetForm()
      switchTab('browse')
    }, 2000)
  } catch (error) {
    showError('Error saving category', error)
    btn.disabled = false
    btn.textContent = '✓ Approve & Save Category'
  }
}

/**
 * Reset create form
 */
export function resetForm() {
  document.getElementById('description').value = ''
  document.getElementById('preview').style.display = 'none'
  document.getElementById('successMessage').style.display = 'none'
  setCurrentPreview(null)
}

/**
 * Switch between tabs
 */
export function switchTab(tabName, event) {
  // Update tab buttons
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'))
  
  // If called from click event, highlight the clicked tab
  if (event && event.target) {
    event.target.classList.add('active')
  } else {
    // If called programmatically, find and highlight the correct tab
    const tabs = document.querySelectorAll('.tab')
    tabs.forEach((tab, index) => {
      if ((tabName === 'browse' && index === 0) || (tabName === 'create' && index === 1)) {
        tab.classList.add('active')
      }
    })
  }

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'))

  if (tabName === 'browse') {
    document.getElementById('browseTab').classList.add('active')
  } else {
    document.getElementById('createTab').classList.add('active')
  }
}
