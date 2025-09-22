/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_MODE: 'mock' | 'production'
  readonly VITE_API_BASE_URL: string
  readonly VITE_DEBUG_MODE: boolean
  readonly VITE_NODE_ENV: 'development' | 'production'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
