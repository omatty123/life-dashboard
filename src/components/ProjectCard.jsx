import { useState } from 'react'

const linkIcons = {
  drive: '📁',
  folder: '📂',
  local: '💻',
  site: '🌐',
  repo: '📦',
  pdfs: '📄',
  reference: '📖',
  tools: '🔧',
  images: '🖼️',
  syllabus: '📋',
}

const statusColors = {
  active: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-amber-100 text-amber-700',
  completed: 'bg-gray-100 text-gray-600',
  idea: 'bg-violet-100 text-violet-700',
}

export default function ProjectCard({ project, categoryColor }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const openLink = (path) => {
    if (path.startsWith('http')) {
      window.open(path, '_blank')
    } else {
      // For local paths, copy to clipboard
      navigator.clipboard.writeText(path)
      alert(`Path copied: ${path}`)
    }
  }

  const linkEntries = Object.entries(project.links || {})

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight">
            {project.name}
          </h3>
          {project.subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">{project.subtitle}</p>
          )}
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[project.status]}`}>
          {project.status}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {project.description}
      </p>

      {/* Quick links - always show first link */}
      <div className="flex flex-wrap gap-2">
        {linkEntries.slice(0, isExpanded ? undefined : 2).map(([key, path]) => (
          <button
            key={key}
            onClick={(e) => {
              e.stopPropagation()
              openLink(path)
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
          >
            <span>{linkIcons[key] || '🔗'}</span>
            <span className="capitalize">{key}</span>
          </button>
        ))}
        {!isExpanded && linkEntries.length > 2 && (
          <span className="text-xs text-gray-400 self-center">
            +{linkEntries.length - 2} more
          </span>
        )}
      </div>

      {/* Commands */}
      {isExpanded && project.commands?.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Quick commands:</p>
          <div className="flex gap-2">
            {project.commands.map(cmd => (
              <code
                key={cmd}
                className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-600"
              >
                {cmd}
              </code>
            ))}
          </div>
        </div>
      )}

      {/* Category indicator */}
      <div
        className="absolute top-0 left-0 w-1 h-full rounded-l-xl"
        style={{ backgroundColor: categoryColor }}
      />
    </div>
  )
}
