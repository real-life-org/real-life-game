/// <reference types="vite/client" />

declare global {
  interface Window {
    DEFAULT_SIMULATION_BUNDLE: any
    SIMULATION_BUNDLE: any
    SIMULATION_BUNDLE_STORAGE_KEY: string
    SCENARIO: any
  }
}

export {}
