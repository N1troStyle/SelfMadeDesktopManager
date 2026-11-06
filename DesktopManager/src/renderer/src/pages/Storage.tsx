import { useCallback, useEffect, useState, ReactElement } from 'react'
import {
  ArrowLeft,
  Folder,
  File,
  FolderOpen,
  RefreshCw,
  Search,
  HardDrive,
  AlertCircle
} from 'lucide-react'
import './Storage.css'
interface StorageItem {
  name: string
  path: string
  type: 'directory' | 'file'
  size: number
  modifiedAt: string | null
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`
}

export default function StoragePage(): ReactElement {
  const [currentPath, setCurrentPath] = useState<string | null>(null)
  const [items, setItems] = useState<StorageItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sortBySize, setSortBySize] = useState(false)
  const [history, setHistory] = useState<string[]>([])

  const loadDirectory = useCallback(async (directoryPath: string) => {
    setLoading(true)
    setError('')

    try {
      const result = await window.api.listDirectory(directoryPath)
      setItems(result)
      setCurrentPath(directoryPath)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read this folder.')
    } finally {
      setLoading(false)
    }
  }, [])

  const chooseFolder = async (): Promise<void> => {
    try {
      const selected = await window.api.chooseFolder()
      if (!selected) return

      setHistory([])
      setSearch('')
      await loadDirectory(selected)
    } catch {
      setError('Could not open the folder picker.')
    }
  }

  const openDirectory = async (item: StorageItem): Promise<void> => {
    if (item.type !== 'directory') return

    if (currentPath) {
      setHistory((previous) => [...previous, currentPath])
    }

    await loadDirectory(item.path)
  }

  const goBack = async (): Promise<void> => {
    const previous = history[history.length - 1]
    if (!previous) return

    setHistory((items) => items.slice(0, -1))
    await loadDirectory(previous)
  }

  useEffect(() => {
    // The user selects a folder explicitly; no automatic disk scan.
  }, [])

  const visibleItems = items
    .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
      return sortBySize ? b.size - a.size : a.name.localeCompare(b.name)
    })

  const totalFiles = items.filter((item) => item.type === 'file').length
  const totalFolders = items.filter((item) => item.type === 'directory').length

  return (
    <div className="storage-page">
      <header className="storage-header">
        <div className="storage-heading-icon">
          <HardDrive size={25} />
        </div>
        <span className="eyebrow">FILE MANAGEMENT</span>
        <h1>Storage Explorer</h1>
        <p>Browse your folders and discover whats stored on your PC.</p>
      </header>

      <section className="storage-toolbar">
        <button className="storage-primary-button" onClick={chooseFolder}>
          <FolderOpen size={17} />
          Choose folder
        </button>

        <button className="storage-button" disabled={!history.length || loading} onClick={goBack}>
          <ArrowLeft size={16} /> Back
        </button>

        <button
          className="storage-button"
          disabled={!currentPath || loading}
          onClick={() => currentPath && void loadDirectory(currentPath)}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </section>

      {currentPath && (
        <div className="storage-path" title={currentPath}>
          <Folder size={16} />
          <span>{currentPath}</span>
        </div>
      )}

      <section className="storage-summary">
        <div>
          <span>Folders</span>
          <strong>{totalFolders}</strong>
        </div>
        <div>
          <span>Files</span>
          <strong>{totalFiles}</strong>
        </div>
        <div>
          <span>Visible items</span>
          <strong>{visibleItems.length}</strong>
        </div>
      </section>

      <section className="storage-browser">
        <div className="storage-list-toolbar">
          <div>
            <h2>Contents</h2>
            <p>{currentPath ? 'Current directory' : 'Choose a folder to begin'}</p>
          </div>

          <div className="storage-list-actions">
            <label className="storage-search">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search names..."
              />
            </label>
            <button
              className="storage-button"
              onClick={() => setSortBySize((value) => !value)}
              disabled={!currentPath}
            >
              {sortBySize ? 'Sort by name' : 'Sort by size'}
            </button>
          </div>
        </div>

        {error && (
          <div className="storage-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="storage-empty">Reading directory...</div>
        ) : !currentPath ? (
          <div className="storage-empty">
            <FolderOpen size={34} />
            <strong>No folder selected</strong>
            <span>Choose a folder to inspect its files and subfolders.</span>
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="storage-empty">No matching items found.</div>
        ) : (
          <div className="storage-table-wrap">
            <table className="storage-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Modified</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((item) => (
                  <tr
                    key={item.path}
                    className={item.type === 'directory' ? 'folder-row' : ''}
                    onDoubleClick={() => void openDirectory(item)}
                    title={item.type === 'directory' ? 'Double-click to open folder' : item.name}
                  >
                    <td>
                      <div className="storage-name">
                        {item.type === 'directory' ? <Folder size={17} /> : <File size={17} />}
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td>{item.type === 'directory' ? '—' : formatSize(item.size)}</td>
                    <td>{formatSize(item.size)}</td>
                    <td>
                      {item.modifiedAt
                        ? new Date(item.modifiedAt).toLocaleDateString()
                        : 'Unavailable'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="storage-hint">
        Tip: double-click a folder to open it. Files are not modified by this view.
      </p>
    </div>
  )
}
