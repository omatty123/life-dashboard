import { useState, useEffect, useCallback, useRef } from 'react';

const categoryToLine = {
  classes: { id: 'teaching', name: 'Teaching', color: '#3B82F6' },
  translation: { id: 'translation', name: 'Translation', color: '#8B5CF6' },
  family: { id: 'family', name: 'Family', color: '#10B981' },
  reading: { id: 'reading', name: 'Reading', color: '#EC4899' },
  play: { id: 'play', name: 'Play', color: '#F59E0B' }
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
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
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

function ProjectCard({ project, color, onClick, isSelected }) {
  return (
    <div
      onClick={() => onClick(project)}
      className={`w-full rounded-xl p-4 flex flex-col gap-2 cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-white/30' : ''
      } bg-[#16161A] hover:bg-[#1c1c21]`}
    >
      <div className="flex justify-between items-center">
        <span className="font-semibold text-[#FAFAF9]">
          {project.name}
        </span>
      </div>

      {project.subtitle && (
        <span className="text-[#6B6B70] text-[13px]">{project.subtitle}</span>
      )}

      {project.links && project.links.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {project.links.slice(0, 3).map((link, i) => (
            <a
              key={i}
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
          ))}
          {project.links.length > 3 && (
            <span className="h-[26px] px-2 flex items-center text-[11px] text-[#6B6B70]">
              +{project.links.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function Column({ line, projects, onSelectProject, selectedId }) {
  const lineProjects = projects.filter(p => {
    const lineInfo = categoryToLine[p.category];
    return lineInfo?.id === line.id;
  });

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
            onClick={onSelectProject}
            isSelected={selectedId === project.id}
          />
        ))}
      </div>
    </div>
  );
}

function DetailPanel({ project, onClose, onAddLink, onDeleteLink, isSignedIn, color }) {
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLink, setNewLink] = useState({ label: '', url: '' });

  const handleAdd = () => {
    if (newLink.label.trim() && newLink.url.trim()) {
      onAddLink(project.id, newLink.label, newLink.url);
      setNewLink({ label: '', url: '' });
      setShowAddLink(false);
    }
  };

  const isReading = project.category === 'reading';

  return (
    <div className="fixed top-0 right-0 w-96 h-full bg-[#0B0B0E] border-l border-[#27272A] p-6 overflow-y-auto z-50">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-[#6B6B70] hover:text-white transition-colors"
      >
        {icons.x}
      </button>

      <div className="mt-8">
        <div
          className="w-3 h-3 rounded-full mb-4"
          style={{ backgroundColor: color }}
        />
        <h2 className="text-2xl font-bold text-white mb-1">
          {project.name}
        </h2>
        {project.subtitle && (
          <p className="text-[#6B6B70] mb-6">{project.subtitle}</p>
        )}

        {isReading && isSignedIn && (
          <div className="mb-6 border-2 border-dashed border-[#27272A] rounded-xl p-4 text-center text-[#6B6B70] text-sm">
            Drop files here to upload
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-[#6B6B70] uppercase tracking-wider">
              Links
            </h3>
            <button
              onClick={() => setShowAddLink(true)}
              className="flex items-center gap-1 text-sm hover:opacity-80 transition-opacity"
              style={{ color }}
            >
              {icons.plus}
              Add
            </button>
          </div>

          {showAddLink && (
            <div className="bg-[#16161A] rounded-lg p-4 space-y-3">
              <input
                type="text"
                placeholder="Label (e.g., notes)"
                value={newLink.label}
                onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                className="w-full bg-[#0B0B0E] border border-[#27272A] rounded-lg px-3 py-2 text-white placeholder-[#6B6B70] text-sm focus:outline-none focus:border-[#3B82F6]"
              />
              <input
                type="url"
                placeholder="URL"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                className="w-full bg-[#0B0B0E] border border-[#27272A] rounded-lg px-3 py-2 text-white placeholder-[#6B6B70] text-sm focus:outline-none focus:border-[#3B82F6]"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                  style={{ backgroundColor: color }}
                >
                  Add
                </button>
                <button
                  onClick={() => { setShowAddLink(false); setNewLink({ label: '', url: '' }); }}
                  className="px-4 py-2 text-[#6B6B70] hover:text-white text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {project.links?.map((link, i) => (
              <div
                key={i}
                className="group flex items-center gap-3 bg-[#16161A] rounded-lg px-4 py-3 hover:bg-[#1c1c21] transition-colors"
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-white hover:underline"
                >
                  {link.label}
                </a>
                <button
                  onClick={() => onDeleteLink(project.id, link.url)}
                  className="text-[#6B6B70] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {icons.x}
                </button>
              </div>
            ))}
            {(!project.links || project.links.length === 0) && (
              <p className="text-[#6B6B70] text-sm">No links yet</p>
            )}
          </div>
        </div>
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
  const [selectedProject, setSelectedProject] = useState(null);
  const [search, setSearch] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
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
        const updated = { ...p, links: [...(p.links || []), { label, url }] };
        if (selectedProject?.id === projectId) {
          setSelectedProject(updated);
        }
        return updated;
      }
      return p;
    }));
  }, [selectedProject]);

  const deleteLink = useCallback((projectId, urlToDelete) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const updated = { ...p, links: p.links.filter(link => link.url !== urlToDelete) };
        if (selectedProject?.id === projectId) {
          setSelectedProject(updated);
        }
        return updated;
      }
      return p;
    }));
  }, [selectedProject]);

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

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (!files.length || !accessToken) return;
    if (selectedProject?.category !== 'reading') {
      setUploadStatus('Select Reading to upload');
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
  }, [accessToken, selectedProject, addLink]);

  const saveSetup = (newClientId) => {
    localStorage.setItem('gdrive-client-id', newClientId);
    setClientId(newClientId);
    setShowSetup(false);
    window.location.reload();
  };

  const isSignedIn = !!accessToken;
  const selectedColor = selectedProject ? (categoryToLine[selectedProject.category]?.color || '#6B6B70') : '#6B6B70';

  return (
    <div
      className={`min-h-screen bg-[#0B0B0E] p-8 ${isDragging ? 'ring-4 ring-inset ring-[#3B82F6]' : ''}`}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
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
            projects={projects.filter(p =>
              !search || p.name.toLowerCase().includes(search.toLowerCase())
            )}
            onSelectProject={setSelectedProject}
            selectedId={selectedProject?.id}
          />
        ))}
      </div>

      {/* Detail Panel */}
      {selectedProject && (
        <DetailPanel
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onAddLink={addLink}
          onDeleteLink={deleteLink}
          isSignedIn={isSignedIn}
          color={selectedColor}
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
