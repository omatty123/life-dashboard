import { useState } from 'react';
import projectData from '../data/projects.json';

const icons = {
  teaching: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
  translation: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>
    </svg>
  ),
  family: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  reading: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  globe: (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
    </svg>
  ),
  folder: (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>
    </svg>
  ),
  file: (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>
    </svg>
  ),
  github: (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
      <path d="M9 18c-4.51 2-5-2-7-2"/>
    </svg>
  ),
  tv: (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/>
    </svg>
  ),
  utensils: (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
    </svg>
  ),
  plane: (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
    </svg>
  ),
  search: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  ),
  link: (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  )
};

const getLinkIcon = (label) => {
  const lower = label.toLowerCase();
  if (lower.includes('web') || lower.includes('site') || lower.includes('app')) return icons.globe;
  if (lower.includes('drive') || lower.includes('folder')) return icons.folder;
  if (lower.includes('doc')) return icons.file;
  if (lower.includes('repo') || lower.includes('github')) return icons.github;
  return icons.link;
};

function ProjectCard({ project, color, isHub = false }) {
  const { stations } = projectData;

  return (
    <div
      className={`w-full rounded-xl p-4 flex flex-col gap-2 ${
        isHub
          ? 'border-2'
          : 'bg-[#16161A]'
      }`}
      style={isHub ? {
        backgroundColor: `${color}20`,
        borderColor: color
      } : {}}
    >
      <div className="flex justify-between items-center">
        <span className={`font-semibold ${isHub ? '' : 'text-[#FAFAF9]'}`} style={isHub ? { color } : {}}>
          {project.name}
        </span>
        {isHub && (
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded"
            style={{ backgroundColor: `${color}40`, color }}
          >
            hub
          </span>
        )}
      </div>

      {project.subtitle && !isHub && (
        <span className="text-[#6B6B70] text-[13px]">{project.subtitle}</span>
      )}

      {/* Hub children */}
      {isHub && project.children && (
        <div className="flex gap-2 mt-1">
          {project.children.map(childId => {
            const child = stations[childId];
            return (
              <a
                key={childId}
                href={child?.links?.[0]?.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-8 bg-[#16161A] rounded-md flex items-center justify-center gap-1.5 text-[11px] text-[#FAFAF9] hover:bg-[#252528] transition-colors"
              >
                {childId === 'media' && icons.tv}
                {childId === 'meals' && icons.utensils}
                {childId === 'gye' && icons.plane}
                <span className="text-[#6B6B70]">{child?.name}</span>
              </a>
            );
          })}
        </div>
      )}

      {/* Links */}
      {project.links && project.links.length > 0 && !isHub && (
        <div className="flex gap-2 mt-1">
          {project.links.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="h-[26px] rounded-md px-2.5 flex items-center gap-1.5 text-[11px] font-medium hover:opacity-80 transition-opacity"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {getLinkIcon(link.label)}
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function Column({ line }) {
  const { stations } = projectData;
  const lineStations = line.stations
    .map(id => ({ id, ...stations[id] }))
    .filter(s => !s.parent); // Exclude child stations (they show inside hub)

  return (
    <div className="flex-1 flex flex-col gap-4 min-w-0">
      {/* Header */}
      <div
        className="h-12 rounded-xl px-4 flex items-center gap-2.5"
        style={{ backgroundColor: line.color }}
      >
        <span className="text-white">{icons[line.id]}</span>
        <span className="text-white text-[15px] font-semibold">{line.name}</span>
        <span
          className="ml-auto w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
          style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
        >
          {lineStations.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3">
        {lineStations.map(station => (
          <ProjectCard
            key={station.id}
            project={station}
            color={line.color}
            isHub={station.children && station.children.length > 0}
          />
        ))}
      </div>
    </div>
  );
}

export default function LifeMap() {
  const [search, setSearch] = useState('');
  const { lines } = projectData;

  return (
    <div className="min-h-screen bg-[#0B0B0E] p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-[28px] font-semibold text-[#FAFAF9]" style={{ fontFamily: 'Fraunces, serif' }}>
            Life Map
          </h1>
          <p className="text-[#6B6B70] text-sm">Everything at a glance</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-[200px] h-10 bg-[#16161A] rounded-lg px-3 flex items-center gap-2">
            <span className="text-[#6B6B70]">{icons.search}</span>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-[#FAFAF9] text-[13px] outline-none flex-1 placeholder-[#6B6B70]"
            />
          </div>
        </div>
      </div>

      {/* Columns */}
      <div className="flex gap-5">
        {lines.map(line => (
          <Column key={line.id} line={line} />
        ))}
      </div>
    </div>
  );
}
