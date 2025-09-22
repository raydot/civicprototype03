export const config = {
  // API
  API_MODE: (import.meta.env.VITE_API_MODE as 'mock' | 'production') || 'mock',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',

  // Debug and evelopment
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === false,
  NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',

  // Computed properties
  get isProduction() {
    return this.NODE_ENV === 'production'
  },

  get isDevelopment() {
    return this.NODE_ENV === 'development'
  },

  get shouldUseMockApi() {
    return this.API_MODE === 'mock'
  }
}

// Validation
if (config.isProduction && !config.API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is required when API_MODE is production')
}

if (!['mock', 'production'].includes(config.API_MODE)) {
  throw new Error('VITE_API_MODE must be either "mock" or "production"')
}

// Log configuration in development
if (config.isDevelopment && config.DEBUG_MODE) {
  console.log('Environment Configuration:', {
    API_MODE: config.API_MODE,
    API_BASE_URL: config.API_BASE_URL,
    DEBUG_MODE: config.DEBUG_MODE,
    NODE_ENV: config.NODE_ENV,
    isProduction: config.isProduction,
    isDevelopment: config.isDevelopment,
    shouldUseMockApi: config.shouldUseMockApi
  })
}
