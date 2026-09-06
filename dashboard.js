const categoryLabels = {
  teaching: { name: 'Teaching · Fall 2026', emoji: '📚' },
  translation: { name: 'Translation', emoji: '🌏' },
  home: { name: 'Home & family', emoji: '🏠' },
  travel: { name: 'Travel', emoji: '🧳' },
  culture: { name: 'Books, music & creative work', emoji: '🎬' },
  tools: { name: 'Everyday tools', emoji: '☀️' },
  courses: { name: 'More teaching', emoji: '📖' },
  workspace: { name: 'Workspace', emoji: '🔧' }
};
const categoryOrder = Object.keys(categoryLabels);
const privateKey = 'life-dashboard-private-links-v1';
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const privateProjects = new Set(projects.filter(p => p.private).map(p => p.id));
let privateLinks = {};
let selectedCategory = 'all';
const search = document.getElementById('projectSearch');
const status = document.getElementById('privateStatus');

// Validate both imported files and stored values. Never render arbitrary markup or URL schemes.
function validatePrivateLinks(value) {
  if (!value || value.version !== 1 || !value.links || typeof value.links !== 'object' || Array.isArray(value.links)) {
    throw new Error('Choose a Life Dashboard private-links JSON file (version 1).');
  }
  const clean = {};
  for (const [id, links] of Object.entries(value.links)) {
    if (!privateProjects.has(id)) continue;
    if (!Array.isArray(links) || !links.length || links.length > 5) throw new Error('Each project needs one to five links.');
    clean[id] = links.map(link => {
      if (!link || typeof link.url !== 'string' || typeof link.label !== 'string' || !link.label.trim() || link.label.length > 40) {
        throw new Error('Each link needs a name and an HTTPS address.');
      }
      let url;
      try { url = new URL(link.url); } catch { throw new Error('A link address is invalid. Use a complete HTTPS address.'); }
      if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Use HTTPS links without embedded credentials.');
      return {label: link.label.trim(), url: url.href};
    });
  }
  if (!Object.keys(clean).length) throw new Error('This file has no matching private projects. Choose the private-links file for this dashboard.');
  return clean;
}
try {
  const saved = localStorage.getItem(privateKey);
  if (saved) privateLinks = validatePrivateLinks(JSON.parse(saved));
} catch { status.textContent = 'Saved private links could not be loaded. Import the file again.'; }
try {
  const order = JSON.parse(localStorage.getItem('life-dashboard-order') || '[]');
  if (Array.isArray(order)) projects.sort((a,b) => {
    const ai = order.indexOf(a.id), bi = order.indexOf(b.id);
    return (ai < 0 ? Infinity : ai) - (bi < 0 ? Infinity : bi) || 0;
  });
} catch { /* Keep the default order if browser storage is unavailable. */ }

const today = new Date();
const dateElement = document.getElementById('today');
dateElement.dateTime = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
dateElement.textContent = today.toLocaleDateString('en-US', {weekday:'long', month:'long', day:'numeric'});

function projectLinks(p) { return p.private ? (privateLinks[p.id] || []) : p.links.filter(l => l.url); }
function linkHTML(p, link, primary) {
  const label = primary ? 'Open ↗' : link.label;
  return `<a class="link${primary ? ' link--primary' : ''}" href="${escapeHTML(link.url)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHTML(p.name)} — ${escapeHTML(link.label)} (opens in a new tab)">${escapeHTML(label)}</a>`;
}
function rowHTML(p) {
  const links = projectLinks(p);
  return `<article class="project" draggable="true" tabindex="0" aria-label="${escapeHTML(p.name)}" data-id="${escapeHTML(p.id)}">
    <div class="project-info"><div class="project-title">${escapeHTML(p.name)}</div>
    ${p.subtitle ? `<div class="project-subtitle">${escapeHTML(p.subtitle)}</div>` : ''}
    ${p.private || p.access ? '<span class="access-note">Private link</span>' : ''}</div>
    <div class="project-links">${links.length ? links.map((l,i)=>linkHTML(p,l,i===0)).join('') : p.private
      ? `<button class="link" type="button" data-connect="${escapeHTML(p.id)}">Connect</button>`
      : '<details class="local-help"><summary class="link">How to open</summary><p>In Codex, choose the META project to open this local workspace.</p></details>'}</div>
  </article>`;
}
function render() {
  document.getElementById('categories').innerHTML = categoryOrder.map(cat => {
    const grouped = projects.filter(p => p.category === cat);
    return `<section class="category category-${cat}" aria-labelledby="heading-${cat}" data-category="${cat}">
      <div class="category-header"><div class="category-icon" aria-hidden="true">${categoryLabels[cat].emoji}</div>
      <h2 class="category-name" id="heading-${cat}">${categoryLabels[cat].name}</h2><span class="category-count">${grouped.length}</span></div>
      <div class="projects-grid">${grouped.map(rowHTML).join('')}</div></section>`;
  }).join('');
  document.getElementById('privateCount').textContent = `· ${Object.keys(privateLinks).length} of ${privateProjects.size} connected`;
  document.getElementById('forgetPrivate').hidden = !Object.keys(privateLinks).length;
  filterProjects();
}
const navItems = [['all','All projects'],['teaching','Fall teaching'],['translation','Translation'],['home','Home & family'],['travel','Travel'],['culture','Books & creative'],['tools','Everyday tools'],['courses','More teaching'],['workspace','Workspace'],['private','Private']];
document.getElementById('categoryNav').innerHTML = navItems.map(([id,label])=>`<button type="button" data-filter="${id}" aria-pressed="${id==='all'}">${label}</button>`).join('');
function filterProjects() {
  const query = search.value.trim().toLocaleLowerCase();
  let count = 0;
  document.querySelectorAll('.project').forEach(el => {
    const p = projects.find(p => p.id === el.dataset.id);
    const text = `${p.name} ${p.subtitle || ''} ${categoryLabels[p.category].name} ${p.private || p.access ? 'private' : ''}`.toLocaleLowerCase();
    el.hidden = !text.includes(query) || !(selectedCategory === 'all' || selectedCategory === p.category || (selectedCategory === 'private' && (p.private || p.access)));
    if (!el.hidden) count++;
  });
  document.querySelectorAll('.category').forEach(section => {
    const count = section.querySelectorAll('.project:not([hidden])').length;
    section.hidden = count === 0;
    section.querySelector('.category-count').textContent = count;
  });
  document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === selectedCategory)));
  document.getElementById('projectCount').textContent = query || selectedCategory !== 'all' ? `${count} of ${projects.length} projects` : `${projects.length} projects`;
  document.getElementById('emptyState').hidden = count !== 0;
}
search.addEventListener('input', filterProjects);
search.addEventListener('keydown', e => {if (e.key === 'Escape') {search.value=''; filterProjects();}});
document.getElementById('categoryNav').addEventListener('click', e => {
  const button=e.target.closest('[data-filter]'); if (!button) return;
  selectedCategory=button.dataset.filter; filterProjects();
});
document.getElementById('resetFilters').addEventListener('click', () => {selectedCategory='all'; search.value=''; filterProjects(); search.focus();});
document.addEventListener('click', e => {
  const button=e.target.closest('[data-connect]'); if (!button) return;
  document.getElementById('privateSettings').open=true;
  status.textContent=`Import your private-links file to connect ${projects.find(p=>p.id===button.dataset.connect).name}.`;
  document.getElementById('privateFile').focus();
});
document.getElementById('privateFile').addEventListener('change', async e => {
  const file = e.target.files[0]; if (!file) return;
  try {
    if (file.size > 32768) throw new Error('This file is too large. Choose the small private-links JSON file.');
    const links = validatePrivateLinks(JSON.parse(await file.text()));
    privateLinks = {...privateLinks, ...links};
    try {
      localStorage.setItem(privateKey, JSON.stringify({version:1,links:privateLinks}));
      status.textContent='Private links connected and remembered in this browser. Open a project to sign in.';
    } catch {status.textContent='Private links work for this visit. Browser storage is unavailable; import again next time.';}
    render();
  } catch (error) {status.textContent=error instanceof SyntaxError ? 'This file is not valid JSON. Choose the Life Dashboard private-links file.' : error.message;}
  e.target.value='';
});
document.getElementById('forgetPrivate').addEventListener('click', () => {
  try {localStorage.removeItem(privateKey);} catch {status.textContent='Browser storage is unavailable. Clear site data in browser settings to forget saved links.'; return;}
  privateLinks={}; status.textContent='Private links forgotten in this browser. Import your file to reconnect.'; render();
});

function saveOrder() {
  const ids = Array.from(document.querySelectorAll('.project')).map(el => el.dataset.id);
  projects.sort((a,b)=>ids.indexOf(a.id)-ids.indexOf(b.id));
  try {localStorage.setItem('life-dashboard-order',JSON.stringify(ids)); document.getElementById('orderStatus').textContent='Project order saved.';}
  catch {document.getElementById('orderStatus').textContent='Order changed for this visit. Browser storage is unavailable.';}
}
let draggedEl=null;
document.addEventListener('dragstart', e => {
  if (!e.target.classList.contains('project')) return;
  draggedEl=e.target; e.dataTransfer.effectAllowed='move'; e.dataTransfer.setData('text/plain',draggedEl.dataset.id); draggedEl.classList.add('dragging');
});
document.addEventListener('dragend', () => {draggedEl?.classList.remove('dragging'); document.querySelectorAll('.drag-over').forEach(el=>el.classList.remove('drag-over')); draggedEl=null;});
document.addEventListener('dragover', e => {
  const target=e.target.closest('.project');
  if (draggedEl && target && target!==draggedEl && target.parentNode===draggedEl.parentNode) {e.preventDefault(); e.dataTransfer.dropEffect='move'; target.classList.add('drag-over');}
});
document.addEventListener('dragleave', e=>e.target.closest('.project')?.classList.remove('drag-over'));
document.addEventListener('drop', e => {
  const target=e.target.closest('.project');
  if (!draggedEl || !target || target===draggedEl || target.parentNode!==draggedEl.parentNode) return;
  e.preventDefault(); target.classList.remove('drag-over');
  target.parentNode.insertBefore(draggedEl,draggedEl.getBoundingClientRect().top<target.getBoundingClientRect().top ? target.nextSibling : target); saveOrder();
});
document.addEventListener('keydown', e => {
  if (!e.altKey || !['ArrowUp','ArrowDown'].includes(e.key) || !e.target.classList.contains('project')) return;
  const row=e.target, siblings=Array.from(row.parentNode.querySelectorAll('.project:not([hidden])'));
  const target=siblings[siblings.indexOf(row)+(e.key==='ArrowUp'?-1:1)]; e.preventDefault(); if (!target) return;
  row.parentNode.insertBefore(row,e.key==='ArrowUp'?target:target.nextSibling); row.focus(); saveOrder();
});
render();
