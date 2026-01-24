import { useState, useEffect } from 'react'
import initialData from '../data/projects.json'

const categoryConfig = {
  classes: { label: 'TEACHING', color: '#3B82F6' },
  translation: { label: 'TRANSLATION', color: '#7C3AED' },
  family: { label: 'FAMILY', color: '#10B981' },
  play: { label: 'PLAY', color: '#F59E0B' },
  reading: { label: 'READING', color: '#EC4899' }
}

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [showAddLink, setShowAddLink] = useState(false)
  const [newLink, setNewLink] = useState({ label: '', url: '' })

  // Load from localStorage or use initial data
  useEffect(() => {
    const saved = localStorage.getItem('life-dashboard-projects')
    if (saved) {
      setProjects(JSON.parse(saved))
    } else {
      setProjects(initialData.projects)
    }
  }, [])

  // Set initial selection
  useEffect(() => {
    if (projects.length > 0 && !selectedId) {
      setSelectedId(projects[0].id)
    }
  }, [projects, selectedId])

  // Save to localStorage when projects change
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('life-dashboard-projects', JSON.stringify(projects))
    }
  }, [projects])

  const selectedProject = projects.find(p => p.id === selectedId)

  const openUrl = (url) => {
    window.open(url, '_blank')
  }

  const addLink = () => {
    if (!newLink.label.trim() || !newLink.url.trim()) return

    setProjects(prev => prev.map(p => {
      if (p.id === selectedId) {
        return {
          ...p,
          links: [...(p.links || []), { label: newLink.label, url: newLink.url }]
        }
      }
      return p
    }))

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

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-[#27272A] flex flex-col">
        <header className="px-6 py-6">
          <span className="text-[#FAFAFA] font-bold text-sm tracking-[0.25em]">LIFE</span>
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12">
        {selectedProject && (
          <ProjectDetail
            project={selectedProject}
            openUrl={openUrl}
            showAddLink={showAddLink}
            setShowAddLink={setShowAddLink}
            newLink={newLink}
            setNewLink={setNewLink}
            addLink={addLink}
            deleteLink={deleteLink}
          />
        )}
      </main>
    </div>
  )
}

function ProjectDetail({ project, openUrl, showAddLink, setShowAddLink, newLink, setNewLink, addLink, deleteLink }) {
  const config = categoryConfig[project.category] || categoryConfig.play

  const getDomain = (url) => {
    try {
      const u = new URL(url)
      return u.hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  return (
    <div>
      {/* Category */}
      <span
        className="text-sm font-semibold tracking-[0.2em]"
        style={{ color: config.color }}
      >
        {config.label}
      </span>

      {/* Title */}
      <h1 className="text-5xl font-bold mt-2 text-white">
        {project.name}
      </h1>

      {/* Subtitle */}
      {project.subtitle && (
        <p className="text-xl text-[#71717A] mt-2">
          {project.subtitle}
        </p>
      )}

      {/* Quick Links */}
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

        {/* Add Link Form */}
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
