/**
 * Main entry point
 * Initializes the application and wires up event handlers
 */

import * as events from './events.js'

// Expose event handlers to global scope for onclick attributes
// (Alternative: Use addEventListener in future refactor)
window.loadCategories = events.loadCategories
window.filterCategories = events.filterCategories
window.toggleCategory = events.toggleCategory
window.editKeywords = events.editKeywords
window.removeKeyword = events.removeKeyword
window.addKeyword = events.addKeyword
window.showEnhanceForm = events.showEnhanceForm
window.hideEnhanceForm = events.hideEnhanceForm
window.enhanceCategory = events.enhanceCategory
window.generatePreview = events.generatePreview
window.approveCategory = events.approveCategory
window.switchTab = events.switchTab

/**
 * Initialize application
 */
function init() {
  // Load categories on startup
  events.loadCategories()
  
  // Set up keyboard shortcuts
  const descriptionInput = document.getElementById('description')
  if (descriptionInput) {
    descriptionInput.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        events.generatePreview()
      }
    })
  }
  
  console.log('Category Admin initialized')
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
