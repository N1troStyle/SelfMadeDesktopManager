/// <reference types="vite/client" />
interface StorageItem {
  name: string
  path: string
  type: 'directory' | 'file'
  size: number
  modifiedAt: string | null
}

interface Window {
  api: {
    chooseFolder: () => Promise<string | null>
    listDirectory: (path: string) => Promise<StorageItem[]>
  }

  desktop: {
    minimize: () => Promise<void>
    toggleMaximize: () => Promise<void>
    close: () => Promise<void>
  }
}
