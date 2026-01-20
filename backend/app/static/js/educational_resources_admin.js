// Educational Resources Admin JavaScript

const API_BASE = window.location.origin
let categories = []
let selectedCategoryId = null
let resources = []
let editingResourceId = null

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadCategories()
  setupEventListeners()
})

function setupEventListeners() {
  document
    .getElementById('searchInput')
    .addEventListener('input', filterCategories)
  document
    .getElementById('typeFilter')
    .addEventListener('change', filterCategories)
  document
    .getElementById('resourceForm')
    .addEventListener('submit', handleResourceSubmit)
}

// Load all categories
async function loadCategories() {
  try {
    showLoading(true)

    // Fetch all resources to get category info
    const response = await fetch(`${API_BASE}/educational-resources/`, {
      credentials: 'include'
    })

    if (!response.ok) throw new Error('Failed to load resources')

    const allResources = await response.json()

    // Group resources by category
    const categoryMap = new Map()
    allResources.forEach((resource) => {
      if (!categoryMap.has(resource.category_id)) {
        categoryMap.set(resource.category_id, {
          id: resource.category_id,
          name: `Category ${resource.category_id}`,
          type: 'issue',
          description: '',
          resources: []
        })
      }
      categoryMap.get(resource.category_id).resources.push(resource)
    })

    // Fetch category details for each
    const categoryIds = Array.from(categoryMap.keys())
    for (const id of categoryIds) {
      try {
        const catResponse = await fetch(
          `${API_BASE}/educational-resources/category/${id}`,
          {
            credentials: 'include'
          }
        )
        if (catResponse.ok) {
          const catData = await catResponse.json()
          const cat = categoryMap.get(id)
          cat.name = catData.name
          cat.type = catData.type
          cat.description = catData.description || ''
        }
      } catch (err) {
        console.error(`Failed to load category ${id}:`, err)
      }
    }

    categories = Array.from(categoryMap.values())
    categories.sort((a, b) => a.name.localeCompare(b.name))

    renderCategories()
    showLoading(false)
  } catch (error) {
    console.error('Error loading categories:', error)
    showToast('Failed to load categories', 'error')
    showLoading(false)
  }
}

// Render categories grid
function renderCategories() {
  const grid = document.getElementById('categoriesGrid')
  const filtered = getFilteredCategories()

  if (filtered.length === 0) {
    grid.innerHTML =
      '<div class="empty-state"><div class="empty-state-icon">📚</div><p>No categories found</p></div>'
    grid.style.display = 'block'
    return
  }

  grid.innerHTML = filtered
    .map(
      (cat) => `
        <div class="category-card ${
          selectedCategoryId === cat.id ? 'selected' : ''
        }" 
             onclick="selectCategory(${cat.id})">
            <div class="category-header">
                <div class="category-title">${escapeHtml(cat.name)}</div>
                <span class="category-badge badge-${cat.type}">${
        cat.type
      }</span>
            </div>
            ${
              cat.description
                ? `<div class="category-description">${escapeHtml(
                    cat.description
                  )}</div>`
                : ''
            }
            <div class="category-stats">
                <div class="stat">
                    <span>📚</span>
                    <span>${cat.resources.length} resource${
        cat.resources.length !== 1 ? 's' : ''
      }</span>
                </div>
            </div>
        </div>
    `
    )
    .join('')

  grid.style.display = 'grid'
}

// Filter categories based on search and type
function getFilteredCategories() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase()
  const typeFilter = document.getElementById('typeFilter').value

  return categories.filter((cat) => {
    const matchesSearch =
      cat.name.toLowerCase().includes(searchTerm) ||
      (cat.description && cat.description.toLowerCase().includes(searchTerm))
    const matchesType = typeFilter === 'all' || cat.type === typeFilter
    return matchesSearch && matchesType
  })
}

function filterCategories() {
  renderCategories()
}

// Select a category to view/edit resources
async function selectCategory(categoryId) {
  selectedCategoryId = categoryId
  const category = categories.find((c) => c.id === categoryId)

  if (!category) return

  // Update UI
  renderCategories()
  document.getElementById(
    'selectedCategoryName'
  ).textContent = `Resources for ${category.name}`
  document.getElementById('resourcesSection').style.display = 'block'

  // Load resources for this category
  await loadCategoryResources(categoryId)
}

// Load resources for a specific category
async function loadCategoryResources(categoryId) {
  try {
    const response = await fetch(
      `${API_BASE}/educational-resources/category/${categoryId}`,
      {
        credentials: 'include'
      }
    )

    if (!response.ok) throw new Error('Failed to load resources')

    const data = await response.json()
    resources = data.resources || []
    renderResources()
  } catch (error) {
    console.error('Error loading resources:', error)
    showToast('Failed to load resources', 'error')
  }
}

// Render resources list
function renderResources() {
  const list = document.getElementById('resourcesList')

  if (resources.length === 0) {
    list.innerHTML =
      '<div class="empty-state"><div class="empty-state-icon">📖</div><p>No resources yet. Add your first resource!</p></div>'
    return
  }

  list.innerHTML = resources
    .map(
      (resource) => `
        <div class="resource-item">
            <div class="resource-header">
                <div class="resource-title">${escapeHtml(resource.title)}</div>
                <div class="resource-actions">
                    <button class="icon-btn" onclick="editResource(${
                      resource.id
                    })" title="Edit">
                        ✏️
                    </button>
                    <button class="icon-btn" onclick="deleteResource(${
                      resource.id
                    })" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
            <div class="resource-meta">
                <span>📍 ${escapeHtml(resource.source)}</span>
                <span>📝 ${escapeHtml(resource.type)}</span>
                ${
                  resource.duration
                    ? `<span>⏱️ ${escapeHtml(resource.duration)}</span>`
                    : ''
                }
            </div>
            ${
              resource.description
                ? `<div class="resource-description">${escapeHtml(
                    resource.description
                  )}</div>`
                : ''
            }
            <a href="${escapeHtml(
              resource.url
            )}" target="_blank" class="resource-url">
                🔗 ${escapeHtml(resource.url)}
            </a>
        </div>
    `
    )
    .join('')
}

// Open modal to add new resource
function openAddResourceModal() {
  if (!selectedCategoryId) {
    showToast('Please select a category first', 'error')
    return
  }

  editingResourceId = null
  document.getElementById('modalTitle').textContent = 'Add Resource'
  document.getElementById('resourceForm').reset()
  document.getElementById('resourceId').value = ''
  document.getElementById('categoryId').value = selectedCategoryId
  document.getElementById('resourceModal').classList.add('active')
}

// Edit existing resource
function editResource(resourceId) {
  const resource = resources.find((r) => r.id === resourceId)
  if (!resource) return

  editingResourceId = resourceId
  document.getElementById('modalTitle').textContent = 'Edit Resource'
  document.getElementById('resourceId').value = resource.id
  document.getElementById('categoryId').value = resource.category_id
  document.getElementById('resourceTitle').value = resource.title
  document.getElementById('resourceSource').value = resource.source
  document.getElementById('resourceType').value = resource.type
  document.getElementById('resourceDuration').value = resource.duration || ''
  document.getElementById('resourceDescription').value =
    resource.description || ''
  document.getElementById('resourceUrl').value = resource.url
  document.getElementById('resourceOrder').value = resource.display_order

  document.getElementById('resourceModal').classList.add('active')
}

// Close resource modal
function closeResourceModal() {
  document.getElementById('resourceModal').classList.remove('active')
  document.getElementById('resourceForm').reset()
  editingResourceId = null
}

// Handle resource form submission
async function handleResourceSubmit(e) {
  e.preventDefault()

  const resourceId = document.getElementById('resourceId').value
  const categoryId = parseInt(document.getElementById('categoryId').value)

  const resourceData = {
    category_id: categoryId,
    title: document.getElementById('resourceTitle').value,
    source: document.getElementById('resourceSource').value,
    type: document.getElementById('resourceType').value,
    duration: document.getElementById('resourceDuration').value || null,
    description: document.getElementById('resourceDescription').value || null,
    url: document.getElementById('resourceUrl').value,
    display_order:
      parseInt(document.getElementById('resourceOrder').value) || 0,
    is_active: true
  }

  try {
    let response
    if (resourceId) {
      // Update existing resource
      response = await fetch(
        `${API_BASE}/educational-resources/${resourceId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(resourceData)
        }
      )
    } else {
      // Create new resource
      response = await fetch(`${API_BASE}/educational-resources/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(resourceData)
      })
    }

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to save resource')
    }

    showToast(
      resourceId
        ? 'Resource updated successfully'
        : 'Resource created successfully',
      'success'
    )
    closeResourceModal()

    // Reload resources
    await loadCategoryResources(categoryId)

    // Update category in the list
    const category = categories.find((c) => c.id === categoryId)
    if (category) {
      category.resources = resources
      renderCategories()
    }
  } catch (error) {
    console.error('Error saving resource:', error)
    showToast(error.message, 'error')
  }
}

// Delete resource
async function deleteResource(resourceId) {
  if (!confirm('Are you sure you want to delete this resource?')) {
    return
  }

  try {
    const response = await fetch(
      `${API_BASE}/educational-resources/${resourceId}`,
      {
        method: 'DELETE',
        credentials: 'include'
      }
    )

    if (!response.ok) throw new Error('Failed to delete resource')

    showToast('Resource deleted successfully', 'success')

    // Reload resources
    await loadCategoryResources(selectedCategoryId)

    // Update category in the list
    const category = categories.find((c) => c.id === selectedCategoryId)
    if (category) {
      category.resources = resources
      renderCategories()
    }
  } catch (error) {
    console.error('Error deleting resource:', error)
    showToast('Failed to delete resource', 'error')
  }
}

// Show/hide loading state
function showLoading(show) {
  document.getElementById('loadingState').style.display = show
    ? 'block'
    : 'none'
  document.getElementById('categoriesGrid').style.display = show
    ? 'none'
    : 'grid'
}

// Show toast notification
function showToast(message, type = 'success') {
  const toast = document.createElement('div')
  toast.className = `toast ${type}`
  toast.textContent = message
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.remove()
  }, 3000)
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    closeResourceModal()
  }
})
