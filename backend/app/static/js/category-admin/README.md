# Category Admin - Modular JavaScript Structure

## File Organization

```
category-admin/
├── README.md           # This file
├── state.js            # Global state management
├── api.js              # All API calls
├── ui.js               # Toast, tabs, UI utilities
├── browse.js           # Browse tab functionality
├── edit.js             # Edit keywords functionality
├── enhance.js          # AI enhancement features
├── transform.js        # Transform/split/merge categories
├── create.js           # Create tab functionality
├── delete.js           # Delete category functionality
└── main.js             # Entry point, initialization
```

## Module Responsibilities

### state.js
- Global application state
- Constants (API_BASE, DEBUG, etc.)

### api.js
- All fetch calls to backend
- API response handling
- Permission checking (403 errors)

### ui.js
- Toast notifications
- Tab switching
- General UI utilities

### browse.js
- Load and display categories
- Filtering and sorting
- Category card rendering

### edit.js
- Inline keyword editing
- Add/remove keywords
- Save keywords

### enhance.js
- AI keyword enhancement
- Enhancement form handling

### transform.js
- Category transformation
- Split/merge functionality
- Transform preview and approval

### create.js
- Generate category preview
- Edit preview
- Approve and create category

### delete.js
- Delete confirmation modal
- Category deletion

### main.js
- Initialize application
- Wire up event listeners
- Export functions to window for inline handlers

## Usage

Include in HTML:
```html
<script type="module" src="/static/js/category-admin/main.js"></script>
```

## Benefits

1. **Maintainability**: Each file has a single responsibility
2. **Testability**: Modules can be tested independently
3. **Readability**: ~150-200 lines per file instead of 1100+
4. **Reusability**: Functions can be imported where needed
5. **Debugging**: Easier to locate and fix issues

## Migration Notes

The original `category_admin.js` (1156 lines) has been split into 10 focused modules averaging ~120 lines each.

All inline event handlers (onclick, etc.) are exposed via `window` object for backward compatibility with existing HTML.
