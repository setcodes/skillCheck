/// <reference types="vite/client" />

declare module '*.wasm?url' {
  const url: string
  export default url
}

declare global {
  interface Window {
    loadPyodide?: (options?: { indexURL?: string }) => Promise<any>
  }
}

export {}
