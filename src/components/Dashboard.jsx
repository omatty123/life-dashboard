import { useState, useEffect, useCallback, useRef } from 'react'
import initialData from '../data/projects.json'

const categoryConfig = {
  classes: { label: 'TEACHING', color: '#3B82F6' },
  translation: { label: 'TRANSLATION', color: '#7C3AED' },
  family: { label: 'FAMILY', color: '#10B981' },
  play: { label: 'PLAY', color: '#F59E0B' },
  reading: { label: 'READING', color: '#EC4899' }
}

const SCOPES = 'https://www.googleapis.com/auth/drive.file'
const READING_FOLDER_NAME = 'Life Dashboard - Reading'

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [showAddLink, setShowAddLink] = useState(false)
  const [newLink, setNewLink] = useState({ label: '', url: '' })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('gdrive-token'))
  const [clientId, setClientId] = useState(() => localStorage.getItem('gdrive-client-id') || '')
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gdrive-api-key') || '')
  const tokenClientRef = useRef(null)

  // Load Google Identity Services
  useEffect(() => {
    if (!clientId) return

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => {
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: (response) => {
          if (response.access_token) {
            setAccessToken(response.access_token)
            localStorage.setItem('gdrive-token', response.access_token)
          }
        },
      })
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [clientId])

  // Load from localStorage, merging any new projects from initialData
  useEffect(() => {
    const saved = localStorage.getItem('life-dashboard-projects')
    if (saved) {
      const savedProjects = JSON.parse(saved)
      const savedIds = new Set(savedProjects.map(p => p.id))
      const newProjects = initialData.projects.filter(p => !savedIds.has(p.id))
      setProjects([...savedProjects, ...newProjects])
    } else {
      setProjects(initialData.projects)
    }
  }, [])

  useEffect(() => {
    if (projects.length > 0 && !selectedId) {
      setSelectedId(projects[0].id)
    }
  }, [projects, selectedId])

  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('life-dashboard-projects', JSON.stringify(projects))
    }
  }, [projects])

  const selectedProject = projects.find(p => p.id === selectedId)

  const openUrl = (url) => {
    window.open(url, '_blank')
  }

  const addLink = useCallback((label, url) => {
    if (!label?.trim() || !url?.trim()) return

    setProjects(prev => prev.map(p => {
      if (p.id === selectedId) {
        return {
          ...p,
          links: [...(p.links || []), { label, url }]
        }
      }
      return p
    }))
  }, [selectedId])

  const handleAddLinkSubmit = () => {
    addLink(newLink.label, newLink.url)
    setNewLink({ label: '', url: '' })
    setShowAddLink(false)
  }

  const deleteLink = (urlToDelete) => {
    setProjects(prev => prev.map(p => {
      if (p.id === selectedId) {
        return {
          ...p,
          links: p.links.filter(link => link.url !== urlToDelete)
        }
      }
      return p
    }))
  }

  const signIn = () => {
    if (tokenClientRef.current) {
      tokenClientRef.current.requestAccessToken({ prompt: 'consent' })
    }
  }

  const getOrCreateReadingFolder = async () => {
    // Search for existing folder
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${READING_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false&spaces=drive&fields=files(id,name)`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    )
    const searchResult = await searchResponse.json()
    console.log('Folder search result:', searchResult)

    if (searchResult.error) {
      throw new Error('Folder search failed: ' + searchResult.error.message)
    }

    if (searchResult.files && searchResult.files.length > 0) {
      console.log('Found existing folder:', searchResult.files[0].id)
      return searchResult.files[0].id
    }

    // Create folder
    console.log('Creating new folder...')
    const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: READING_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder'
      })
    })
    const folder = await createResponse.json()
    console.log('Folder creation result:', folder)

    if (folder.error) {
      throw new Error('Folder creation failed: ' + folder.error.message)
    }

    if (!folder.id) {
      throw new Error('No folder ID returned: ' + JSON.stringify(folder))
    }

    return folder.id
  }

  const uploadFileToDrive = async (file) => {
    const folderId = await getOrCreateReadingFolder()

    // Step 1: Create file metadata
    const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: file.name,
        parents: [folderId]
      })
    })
    const fileMetadata = await createResponse.json()
    console.log('Created file:', fileMetadata)

    if (!fileMetadata.id) {
      throw new Error('Failed to create file: ' + JSON.stringify(fileMetadata))
    }

    // Step 2: Upload content
    const uploadResponse = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileMetadata.id}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': file.type || 'application/octet-stream'
        },
        body: file
      }
    )
    const uploadResult = await uploadResponse.json()
    console.log('Upload result:', uploadResult)

    return { id: fileMetadata.id, webViewLink: `https://drive.google.com/file/d/${fileMetadata.id}/view` }
  }

  const handleDrop = useCallback(async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    console.log('File dropped!')
    const files = Array.from(e.dataTransfer.files)
    console.log('Files:', files)

    if (files.length === 0) {
      setUploadStatus('No files detected')
      setTimeout(() => setUploadStatus(''), 3000)
      return
    }

    if (!accessToken) {
      setUploadStatus('Please sign in to Google first')
      setTimeout(() => setUploadStatus(''), 3000)
      return
    }

    // Only process if we're on the Reading project
    if (selectedProject?.category !== 'reading') {
      setUploadStatus('Switch to Reading to upload files')
      setTimeout(() => setUploadStatus(''), 3000)
      return
    }

    setIsUploading(true)
    setUploadStatus(`Uploading ${files.length} file(s)...`)

    try {
      for (const file of files) {
        console.log('Uploading:', file.name)
        const result = await uploadFileToDrive(file)
        console.log('Upload result:', result)

        if (result.error) {
          throw new Error(result.error.message || 'Upload failed')
        }

        const link = `https://drive.google.com/file/d/${result.id}/view`
        const label = file.name.replace(/\.[^/.]+$/, '') // Remove extension

        setProjects(prev => prev.map(p => {
          if (p.id === selectedProject.id) {
            return {
              ...p,
              links: [...(p.links || []), { label, url: link }]
            }
          }
          return p
        }))

        setUploadStatus(`Uploaded: ${file.name}`)
      }
      setUploadStatus('Upload complete!')
      setTimeout(() => setUploadStatus(''), 3000)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus('Error: ' + error.message)
      setTimeout(() => setUploadStatus(''), 10000)
    }

    setIsUploading(false)
  }, [accessToken, selectedProject])

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const saveSetup = (newClientId, newApiKey) => {
    localStorage.setItem('gdrive-client-id', newClientId)
    localStorage.setItem('gdrive-api-key', newApiKey)
    setClientId(newClientId)
    setApiKey(newApiKey)
    setShowSetup(false)
    window.location.reload()
  }

  const isSignedIn = !!accessToken

  return (
    <div
      className={`min-h-screen bg-[#09090B] text-white flex ${isDragging ? 'ring-4 ring-inset ring-[#3B82F6]' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Sidebar */}
      <aside className="w-72 border-r border-[#27272A] flex flex-col">
        <header className="px-6 py-6 flex items-center justify-between">
          <span className="text-[#FAFAFA] font-bold text-sm tracking-[0.25em]">LIFE</span>
          <button
            onClick={() => setShowSetup(true)}
            className="text-[#52525B] hover:text-white text-xs"
            title="Setup Google Drive"
          >
            ⚙
          </button>
        </header>

        <nav className="flex-1 px-3">
          {projects.map(project => {
            const config = categoryConfig[project.category] || categoryConfig.play
            const isSelected = project.id === selectedId

            return (
              <button
                key={project.id}
                onClick={() => setSelectedId(project.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  isSelected
                    ? 'bg-[#1E3A5F] text-white'
                    : 'text-[#A1A1AA] hover:bg-[#18181B] hover:text-white'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: config.color }}
                />
                <span className="truncate">
                  {project.name}
                  {project.subtitle && ` ${project.subtitle}`}
                </span>
              </button>
            )
          })}
        </nav>

        {/* Google Sign In */}
        <div className="px-6 py-4 border-t border-[#27272A]">
          {!clientId ? (
            <button
              onClick={() => setShowSetup(true)}
              className="text-xs text-[#52525B] hover:text-white"
            >
              Setup Google Drive →
            </button>
          ) : !isSignedIn ? (
            <button
              onClick={signIn}
              className="text-xs text-[#3B82F6] hover:text-[#60A5FA]"
            >
              Sign in to Google
            </button>
          ) : (
            <span className="text-xs text-[#22C55E]">✓ Google Drive connected</span>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 relative">
        {selectedProject && (
          <ProjectDetail
            project={selectedProject}
            openUrl={openUrl}
            showAddLink={showAddLink}
            setShowAddLink={setShowAddLink}
            newLink={newLink}
            setNewLink={setNewLink}
            addLink={handleAddLinkSubmit}
            deleteLink={deleteLink}
            isSignedIn={isSignedIn}
          />
        )}

        {/* Upload Status */}
        {uploadStatus && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#18181B] rounded-lg border border-[#27272A] text-sm text-white z-20">
            {isUploading && <span className="mr-2">⏳</span>}
            {uploadStatus}
          </div>
        )}
      </main>

      {/* Setup Modal */}
      {showSetup && (
        <SetupModal
          onClose={() => setShowSetup(false)}
          onSave={saveSetup}
          initialClientId={clientId}
          initialApiKey={apiKey}
        />
      )}
    </div>
  )
}

function ProjectDetail({ project, openUrl, showAddLink, setShowAddLink, newLink, setNewLink, addLink, deleteLink, isSignedIn }) {
  const config = categoryConfig[project.category] || categoryConfig.play

  const getDomain = (url) => {
    try {
      const u = new URL(url)
      return u.hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  const isReading = project.category === 'reading'

  return (
    <div>
      <span
        className="text-sm font-semibold tracking-[0.2em]"
        style={{ color: config.color }}
      >
        {config.label}
      </span>

      <h1 className="text-5xl font-bold mt-2 text-white">
        {project.name}
      </h1>

      {project.subtitle && (
        <p className="text-xl text-[#71717A] mt-2">
          {project.subtitle}
        </p>
      )}

      {/* Drop zone hint for Reading */}
      {isReading && isSignedIn && (
        <div className="mt-6 border-2 border-dashed border-[#27272A] rounded-xl p-6 text-center text-[#52525B]">
          Drop files here to upload to Google Drive
        </div>
      )}

      <div className="mt-10">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-sm font-medium text-[#A1A1AA]">Quick Links</h2>
          <button
            onClick={() => setShowAddLink(true)}
            className="text-sm text-[#3B82F6] hover:text-[#60A5FA] transition-colors"
          >
            + Add Link
          </button>
        </div>

        {showAddLink && (
          <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-4 mb-4 max-w-md">
            <input
              type="text"
              placeholder="Label (e.g., notes, article)"
              value={newLink.label}
              onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
              className="w-full bg-[#09090B] border border-[#27272A] rounded-lg px-3 py-2 text-white placeholder-[#52525B] mb-3 focus:outline-none focus:border-[#3B82F6]"
            />
            <input
              type="url"
              placeholder="URL"
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              className="w-full bg-[#09090B] border border-[#27272A] rounded-lg px-3 py-2 text-white placeholder-[#52525B] mb-3 focus:outline-none focus:border-[#3B82F6]"
            />
            <div className="flex gap-2">
              <button
                onClick={addLink}
                className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddLink(false)
                  setNewLink({ label: '', url: '' })
                }}
                className="px-4 py-2 text-[#A1A1AA] hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          {project.links?.map((link) => (
            <div
              key={link.url}
              className="group relative bg-[#18181B] border border-[#27272A] rounded-xl px-6 py-4 text-left hover:bg-[#1F1F23] hover:border-[#3F3F46] transition-colors min-w-[200px]"
            >
              <button
                onClick={() => openUrl(link.url)}
                className="text-left w-full"
              >
                <span className="block text-white font-medium capitalize">
                  {link.label}
                </span>
                <span className="block text-[#52525B] text-sm mt-1 truncate">
                  {getDomain(link.url)}
                </span>
              </button>
              <button
                onClick={() => deleteLink(link.url)}
                className="absolute top-2 right-2 text-[#52525B] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete link"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SetupModal({ onClose, onSave, initialClientId, initialApiKey }) {
  const [clientId, setClientId] = useState(initialClientId)
  const [apiKey, setApiKey] = useState(initialApiKey)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-6 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-4">Google Drive Setup</h2>

        <div className="text-sm text-[#A1A1AA] mb-4 space-y-2">
          <p>To enable file uploads:</p>
          <ol className="list-decimal list-inside space-y-1 text-[#71717A]">
            <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-[#3B82F6] hover:underline">Google Cloud Console</a></li>
            <li>Create a project → Enable "Google Drive API"</li>
            <li>Go to Credentials → Create OAuth 2.0 Client ID (Web application)</li>
            <li>Add these to Authorized JavaScript origins:
              <ul className="ml-4 mt-1 space-y-1">
                <li><code className="bg-[#09090B] px-1 rounded text-xs">https://omatty123.github.io</code></li>
                <li><code className="bg-[#09090B] px-1 rounded text-xs">http://localhost:5173</code></li>
              </ul>
            </li>
            <li>Copy the Client ID below</li>
          </ol>
        </div>

        <input
          type="text"
          placeholder="OAuth Client ID (ends with .apps.googleusercontent.com)"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="w-full bg-[#09090B] border border-[#27272A] rounded-lg px-3 py-2 text-white placeholder-[#52525B] mb-4 focus:outline-none focus:border-[#3B82F6] text-sm"
        />

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[#A1A1AA] hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(clientId, apiKey)}
            className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
