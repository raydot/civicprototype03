/**
 * Shared API utilities for admin tools
 */

export const API_BASE = window.location.origin

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint path
 * @param {object} options - Fetch options
 * @returns {Promise<any>} Response data
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  }
  
  const response = await fetch(url, { ...defaultOptions, ...options })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`)
  }
  
  return response.json()
}

/**
 * Show error message to user
 * @param {string} message - Error message
 * @param {Error} error - Original error object
 */
export function showError(message, error) {
  console.error(message, error)
  alert(`${message}\n\n${error.message}`)
}

/**
 * Show success message to user
 * @param {string} message - Success message
 */
export function showSuccess(message) {
  alert(message)
}
