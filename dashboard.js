// Browser-local private destinations augment the original compact launcher.
const privateKey = 'life-dashboard-private-links-v1';
const privateProjects = new Set(['hist213', 'teaching-today', 'teaching-fall-2026-roster', 'fall-2026-workspace', 'dunes-translator', 'banglangdang-reunion-2026']);
let privateLinks = {};
const defaultPrivateLinks = new Map();
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
} catch { /* A missing or invalid preference must not hide the launcher. */ }
// Existing rendering uses HTML templates; escape all imported attribute/text values.
const escapePrivateHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function connectPrivateLinks(projects) {
  for (const p of projects) {
    if (!privateProjects.has(p.id)) continue;
    if (!defaultPrivateLinks.has(p.id)) defaultPrivateLinks.set(p.id, p.links);
    p.links = privateLinks[p.id] ? privateLinks[p.id].map(link => ({ label: escapePrivateHTML(link.label), url: escapePrivateHTML(link.url) })) : defaultPrivateLinks.get(p.id);
  }
}
function bindPrivateSettings(projects, refresh) {
  const settings=document.getElementById('privateSettings');
  const status=document.getElementById('privateStatus');
  const forget=document.getElementById('forgetPrivate');
  function update() {
    document.getElementById('privateCount').textContent = Object.keys(privateLinks).length ? '· connected' : '';
    forget.hidden=!Object.keys(privateLinks).length;
    connectPrivateLinks(projects);
  }
  update();
  document.addEventListener('click', e => {
    if (!e.target.closest('.private-connect')) return;
    settings.open=true;
    document.getElementById('privateFile').focus();
  });
  document.getElementById('privateFile').addEventListener('change', async e => {
    const file=e.target.files[0]; if (!file) return;
    try {
      if (file.size>32768) throw new Error('Choose the small Life Dashboard private-links file.');
      privateLinks={...privateLinks,...validatePrivateLinks(JSON.parse(await file.text()))};
      try {
        localStorage.setItem(privateKey,JSON.stringify({version:1,links:privateLinks}));
        status.textContent='Private links connected and remembered in this browser.';
      } catch { status.textContent='Connected for this visit. Browser storage is unavailable; import again next time.'; }
      update(); refresh();
    } catch (error) { status.textContent=error instanceof SyntaxError ? 'Choose a valid Life Dashboard private-links JSON file.' : error.message; }
    e.target.value='';
  });
  forget.addEventListener('click', () => {
    try { localStorage.removeItem(privateKey); }
    catch { status.textContent='Clear site data in browser settings to forget saved links.'; return; }
    privateLinks={}; update(); refresh(); status.textContent='Private links forgotten in this browser.';
  });
}
