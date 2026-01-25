import { useState, useEffect, useCallback, useRef } from 'react';

const categoryToLine = {
  classes: 'teaching',
  translation: 'translation',
  family: 'family',
  reading: 'reading',
  play: 'play'
};

const lineColors = {
  teaching: '#3B82F6',
  translation: '#8B5CF6',
  family: '#10B981',
  reading: '#EC4899',
  play: '#F59E0B'
};

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
  play: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
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
  search: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  ),
  link: (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  ),
  plus: (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="M12 5v14"/>
    </svg>
  ),
  x: (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  ),
  grip: (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>
    </svg>
  ),
  settings: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
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

const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const READING_FOLDER_NAME = 'Life Dashboard - Reading';

const initialProjects = [
  { id: "hist213", name: "HIST 213", subtitle: "East Asia", category: "classes", links: [{"label": "web", "url": "https://omatty123.github.io/hist213-dashboard/"}, {"label": "drive", "url": "https://drive.google.com"}] },
  { id: "chja370", name: "CHJA 370", category: "classes", links: [{"label": "doc", "url": "https://docs.google.com/document/d/10NoIMoM1vxWNxxIJIPYsjhF1QkpYeOI6qBvjbk0CW9k/edit?tab=t.0"}] },
  { id: "montafon", name: "Montafon", subtitle: "Moonlight", category: "translation", links: [{"label": "repo", "url": "https://github.com/omatty123/MontafonMoonlight"}] },
  { id: "buddhist", name: "Buddhist", subtitle: "Travel", category: "translation", links: [{"label": "drive", "url": "https://drive.google.com/drive/u/0/folders/1lZ6WZD0ChF0u6FlpHmRJk3xq299uQxgL"}] },
  { id: "bld-hub", name: "BLD", subtitle: "Hub", category: "family", links: [{"label": "site", "url": "https://omatty123.github.io/banglangdang-hub/"}] },
  { id: "media", name: "Media", subtitle: "Dashboard", category: "family", links: [{"label": "site", "url": "https://omatty123.github.io/media-dashboard/"}] },
  { id: "gye", name: "GYE", subtitle: "Travel Fund", category: "family", links: [{"label": "site", "url": "https://omatty123.github.io/gye-travel-fund/"}] },
  { id: "meals", name: "Meals", subtitle: "Planner", category: "family", links: [{"label": "app", "url": "https://family-meals-eight.vercel.app/plan/"}] },
  { id: "dunes", name: "Dunes", subtitle: "Book Site", category: "family", links: [{"label": "site", "url": "https://omatty123.github.io/among-the-dunes/"}] },
  { id: "chuff", name: "Chuff", subtitle: "Loop", category: "family", links: [{"label": "site", "url": "https://omatty123.github.io/chuff-loop-status/"}] },
  { id: "reading", name: "Reading", category: "reading", links: [] }
];

function AddLinkModal({ project, color, onClose, onAdd }) {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (label.trim() && url.trim()) {
      onAdd(project.id, label.trim(), url.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <form onSubmit={handleSubmit} className="bg-[#16161A] border border-[#27272A] rounded-xl p-5 w-80" onClick={e => e.stopPropagation()}>
        <h3 className="text-white font-semibold mb-4">Add link to {project.name}</h3>
        <input
          type="text"
          placeholder="Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full bg-[#0B0B0E] border border-[#27272A] rounded-lg px-3 py-2 text-white placeholder-[#6B6B70] text-sm mb-3"
          autoFocus
        />
        <input
          type="url"
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full bg-[#0B0B0E] border border-[#27272A] rounded-lg px-3 py-2 text-white placeholder-[#6B6B70] text-sm mb-4"
        />
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-[#6B6B70] hover:text-white text-sm">Cancel</button>
          <button type="submit" className="px-3 py-1.5 rounded-lg text-white text-sm" style={{ backgroundColor: color }}>Add</button>
        </div>
      </form>
    </div>
  );
}

function ProjectCard({ project, color, onAddLink, onDeleteLink, onDragStart, onDragOver, onDrop, isDragging }) {
  const [showActions, setShowActions] = useState(false);
  const mainLink = project.links?.[0]?.url;

  const handleCardClick = () => {
    if (mainLink) {
      window.open(mainLink, '_blank');
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, project)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, project)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={`w-full rounded-xl p-4 flex flex-col gap-2 bg-[#16161A] hover:bg-[#1c1c21] transition-all ${
        isDragging ? 'opacity-50' : ''
      } ${mainLink ? 'cursor-pointer' : ''}`}
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className={`text-[#6B6B70] cursor-grab active:cursor-grabbing ${showActions ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
            {icons.grip}
          </span>
          <span className="font-semibold text-[#FAFAF9]">
            {project.name}
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onAddLink(project); }}
          className={`text-[#6B6B70] hover:text-white transition-opacity ${showActions ? 'opacity-100' : 'opacity-0'}`}
          title="Add link"
        >
          {icons.plus}
        </button>
      </div>

      {project.subtitle && (
        <span className="text-[#6B6B70] text-[13px] ml-6">{project.subtitle}</span>
      )}

      {project.links && project.links.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1 ml-6">
          {project.links.map((link, i) => (
            <div key={i} className="group relative">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="h-[26px] rounded-md px-2.5 flex items-center gap-1.5 text-[11px] font-medium hover:opacity-80 transition-opacity"
                style={{ backgroundColor: `${color}20`, color }}
              >
                {getLinkIcon(link.label)}
                {link.label}
              </a>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteLink(project.id, link.url); }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete link"
              >
                {icons.x}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Column({ line, projects, onAddLink, onDeleteLink, onReorder, draggedProject }) {
  const lineId = line.id;
  const lineProjects = projects.filter(p => categoryToLine[p.category] === lineId);

  const handleDragStart = (e, project) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', project.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetProject) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && draggedId !== targetProject.id) {
      onReorder(draggedId, targetProject.id, lineId);
    }
  };

  const handleColumnDrop = (e) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId) {
      onReorder(draggedId, null, lineId);
    }
  };

  return (
    <div
      className="flex-1 flex flex-col gap-4 min-w-0"
      onDragOver={handleDragOver}
      onDrop={handleColumnDrop}
    >
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
          {lineProjects.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3">
        {lineProjects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            color={line.color}
            onAddLink={onAddLink}
            onDeleteLink={onDeleteLink}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            isDragging={draggedProject?.id === project.id}
          />
        ))}
      </div>
    </div>
  );
}

function SetupModal({ onClose, onSave, initialClientId }) {
  const [clientId, setClientId] = useState(initialClientId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#16161A] border border-[#27272A] rounded-xl p-6 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-4">Google Drive Setup</h2>
        <div className="text-sm text-[#A1A1AA] mb-4 space-y-2">
          <p>To enable file uploads for Reading:</p>
          <ol className="list-decimal list-inside space-y-1 text-[#6B6B70]">
            <li>Go to Google Cloud Console</li>
            <li>Create OAuth 2.0 Client ID</li>
            <li>Add origins: https://omatty123.github.io and http://localhost:5173</li>
          </ol>
        </div>
        <input
          type="text"
          placeholder="OAuth Client ID"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="w-full bg-[#0B0B0E] border border-[#27272A] rounded-lg px-3 py-2 text-white placeholder-[#6B6B70] mb-4 text-sm"
        />
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-[#6B6B70] hover:text-white">Cancel</button>
          <button onClick={() => onSave(clientId)} className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg">Save</button>
        </div>
      </div>
    </div>
  );
}

export default function LifeMap() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const [addLinkProject, setAddLinkProject] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedProject, setDraggedProject] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('gdrive-token'));
  const [clientId, setClientId] = useState(() => localStorage.getItem('gdrive-client-id') || '');
  const tokenClientRef = useRef(null);

  const lines = [
    { id: 'teaching', name: 'Teaching', color: '#3B82F6' },
    { id: 'translation', name: 'Translation', color: '#8B5CF6' },
    { id: 'family', name: 'Family', color: '#10B981' },
    { id: 'reading', name: 'Reading', color: '#EC4899' }
  ];

  // Load Google Identity Services
  useEffect(() => {
    if (!clientId) return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: (response) => {
          if (response.access_token) {
            setAccessToken(response.access_token);
            localStorage.setItem('gdrive-token', response.access_token);
          }
        },
      });
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, [clientId]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('life-dashboard-projects');
    if (saved) {
      try {
        const savedProjects = JSON.parse(saved);
        if (Array.isArray(savedProjects) && savedProjects.length > 0 && savedProjects[0].id) {
          const savedIds = new Set(savedProjects.map(p => p.id));
          const newProjects = initialProjects.filter(p => !savedIds.has(p.id));
          setProjects([...savedProjects, ...newProjects]);
        } else {
          setProjects(initialProjects);
        }
      } catch {
        setProjects(initialProjects);
      }
    } else {
      setProjects(initialProjects);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('life-dashboard-projects', JSON.stringify(projects));
    }
  }, [projects]);

  const addLink = useCallback((projectId, label, url) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, links: [...(p.links || []), { label, url }] };
      }
      return p;
    }));
  }, []);

  const deleteLink = useCallback((projectId, urlToDelete) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, links: p.links.filter(link => link.url !== urlToDelete) };
      }
      return p;
    }));
  }, []);

  const reorderProjects = useCallback((draggedId, targetId, targetLineId) => {
    setProjects(prev => {
      const newProjects = [...prev];
      const draggedIndex = newProjects.findIndex(p => p.id === draggedId);
      const draggedProject = newProjects[draggedIndex];

      // Update category if moving to different column
      const newCategory = Object.entries(categoryToLine).find(([, lineId]) => lineId === targetLineId)?.[0];
      if (newCategory && draggedProject.category !== newCategory) {
        draggedProject.category = newCategory;
      }

      // Remove from old position
      newProjects.splice(draggedIndex, 1);

      if (targetId) {
        // Insert before target
        const targetIndex = newProjects.findIndex(p => p.id === targetId);
        newProjects.splice(targetIndex, 0, draggedProject);
      } else {
        // Add to end of column
        const lineProjects = newProjects.filter(p => categoryToLine[p.category] === targetLineId);
        const lastInLine = lineProjects[lineProjects.length - 1];
        if (lastInLine) {
          const lastIndex = newProjects.findIndex(p => p.id === lastInLine.id);
          newProjects.splice(lastIndex + 1, 0, draggedProject);
        } else {
          newProjects.push(draggedProject);
        }
      }

      return newProjects;
    });
  }, []);

  const signIn = () => {
    if (tokenClientRef.current) {
      tokenClientRef.current.requestAccessToken({ prompt: 'consent' });
    }
  };

  const getOrCreateReadingFolder = async () => {
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${READING_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false&spaces=drive&fields=files(id,name)`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );
    const searchResult = await searchResponse.json();
    if (searchResult.files?.length > 0) return searchResult.files[0].id;

    const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: READING_FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' })
    });
    const folder = await createResponse.json();
    return folder.id;
  };

  const uploadFileToDrive = async (file) => {
    const folderId = await getOrCreateReadingFolder();
    const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: file.name, parents: [folderId] })
    });
    const fileMetadata = await createResponse.json();
    await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileMetadata.id}?uploadType=media`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': file.type || 'application/octet-stream' },
      body: file
    });
    return { id: fileMetadata.id };
  };

  const handleFileDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragging(false);

    // Check if it's a file drop (not card reorder)
    if (!e.dataTransfer.files.length) return;

    const files = Array.from(e.dataTransfer.files);
    if (!accessToken) {
      setUploadStatus('Sign in to upload');
      setTimeout(() => setUploadStatus(''), 3000);
      return;
    }

    setUploadStatus('Uploading...');
    try {
      for (const file of files) {
        const result = await uploadFileToDrive(file);
        const link = `https://drive.google.com/file/d/${result.id}/view`;
        const label = file.name.replace(/\.[^/.]+$/, '');
        addLink('reading', label, link);
      }
      setUploadStatus('Done!');
      setTimeout(() => setUploadStatus(''), 2000);
    } catch (error) {
      setUploadStatus('Error: ' + error.message);
      setTimeout(() => setUploadStatus(''), 5000);
    }
  }, [accessToken, addLink]);

  const saveSetup = (newClientId) => {
    localStorage.setItem('gdrive-client-id', newClientId);
    setClientId(newClientId);
    setShowSetup(false);
    window.location.reload();
  };

  const isSignedIn = !!accessToken;
  const filteredProjects = projects.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div
      className={`min-h-screen bg-[#0B0B0E] p-8 ${isDragging ? 'ring-4 ring-inset ring-[#3B82F6]' : ''}`}
      onDrop={handleFileDrop}
      onDragOver={(e) => { e.preventDefault(); if (e.dataTransfer.types.includes('Files')) setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-[28px] font-semibold text-[#FAFAF9]" style={{ fontFamily: 'Fraunces, serif' }}>
            Life Map
          </h1>
          <p className="text-[#6B6B70] text-sm">Everything at a glance</p>
        </div>

        <div className="flex items-center gap-3">
          {!clientId ? (
            <button onClick={() => setShowSetup(true)} className="text-[#6B6B70] hover:text-white text-sm">
              Setup Drive
            </button>
          ) : !isSignedIn ? (
            <button onClick={signIn} className="text-[#3B82F6] hover:text-[#60A5FA] text-sm">
              Sign in
            </button>
          ) : (
            <span className="text-[#22C55E] text-sm">Drive connected</span>
          )}
          <button onClick={() => setShowSetup(true)} className="text-[#6B6B70] hover:text-white">
            {icons.settings}
          </button>
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
          <Column
            key={line.id}
            line={line}
            projects={filteredProjects}
            onAddLink={setAddLinkProject}
            onDeleteLink={deleteLink}
            onReorder={reorderProjects}
            draggedProject={draggedProject}
          />
        ))}
      </div>

      {/* Add Link Modal */}
      {addLinkProject && (
        <AddLinkModal
          project={addLinkProject}
          color={lineColors[categoryToLine[addLinkProject.category]] || '#6B6B70'}
          onClose={() => setAddLinkProject(null)}
          onAdd={addLink}
        />
      )}

      {/* Upload Status */}
      {uploadStatus && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#16161A] rounded-lg border border-[#27272A] text-sm text-white">
          {uploadStatus}
        </div>
      )}

      {/* Setup Modal */}
      {showSetup && (
        <SetupModal
          onClose={() => setShowSetup(false)}
          onSave={saveSetup}
          initialClientId={clientId}
        />
      )}
    </div>
  );
}
