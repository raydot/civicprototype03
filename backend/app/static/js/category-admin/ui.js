/**
 * UI Module - Toast notifications, tabs, and general UI utilities
 */

/**
 * Show toast notification
 */
export function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icon = type === 'success' ? '✓' : '✕';

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;

  container.appendChild(toast);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Switch between tabs
 */
export function switchTab(tabName, event) {
  // Update tab buttons
  document
    .querySelectorAll('.tab')
    .forEach((tab) => tab.classList.remove('active'));

  // If event is provided, highlight the clicked tab
  if (event && event.target) {
    event.target.classList.add('active');
  } else {
    // If no event (programmatic call), find and activate the correct tab button
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach((tab) => {
      if (
        (tabName === 'browse' && tab.textContent.includes('Browse')) ||
        (tabName === 'create' && tab.textContent.includes('Create'))
      ) {
        tab.classList.add('active');
      }
    });
  }

  // Update tab content
  document
    .querySelectorAll('.tab-content')
    .forEach((content) => content.classList.remove('active'));

  if (tabName === 'browse') {
    document.getElementById('browseTab').classList.add('active');
  } else {
    document.getElementById('createTab').classList.add('active');
  }
}

// Make showToast available globally for inline event handlers
window.showToast = showToast;
window.switchTab = switchTab;
