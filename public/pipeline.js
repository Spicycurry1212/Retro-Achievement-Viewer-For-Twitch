(() => {
  const KEY = 'retrounlock-creator-preferences-v1';
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  let saved = read(); let games = [];
  const save = () => localStorage.setItem(KEY, JSON.stringify(saved));
  const byId = id => document.getElementById(id);
  const value = (id, fallback = '') => byId(id)?.value || fallback;
  const esc = value => String(value || '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));

  function restore() {
    const name = byId('overlay-name'); if (name && saved.name !== undefined) name.value = saved.name;
    const game = byId('game-select'); if (game && saved.gameId && [...game.options].some(option => option.value === String(saved.gameId))) game.value = String(saved.gameId);
    for (const id of ['theme-accent', 'theme-background', 'theme-opacity', 'theme-columns', 'theme-volume']) { const input = byId(id); if (input && saved[id] !== undefined) input.value = saved[id]; }
    const layout = document.querySelector(`input[name="layout"][value="${saved.layout || 'grid'}"]`); if (layout) { layout.checked = true; byId('layout-select').value = layout.value; }
    const sound = byId('theme-sound'); const hint = sound?.closest('label')?.querySelector('small');
    if (hint && saved.soundFile) hint.textContent = `✓ ${saved.soundName || 'Custom sound'} saved locally — reused for new alerts`;
  }
  function recordFields() {
    saved.name = value('overlay-name', 'My Retro overlay'); saved.gameId = Number(value('game-select')) || null;
    saved.layout = document.querySelector('input[name="layout"]:checked')?.value || 'grid';
    for (const id of ['theme-accent', 'theme-background', 'theme-opacity', 'theme-columns', 'theme-volume']) saved[id] = value(id);
    save();
  }
  async function uploadSound(file) {
    if (!file) return; if (file.size > 5 * 1024 * 1024) throw new Error('Audio file must be 5 MB or smaller.');
    const data = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
    const response = await fetch('/api/sounds', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: file.type, data }) });
    const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Unable to save custom sound.');
    saved.soundFile = result.soundFile; saved.soundName = file.name; save(); restore();
  }
  function renderCreated(overlay) {
    const list = byId('overlays'); if (!list) return;
    const href = `${location.origin}/${overlay.layout === 'alert' ? 'overlay.html' : 'grid.html'}?id=${encodeURIComponent(overlay.id)}`;
    list.innerHTML = `<article class="overlay-row"><img src="${esc(overlay.gameIcon)}" alt=""><div><strong>${esc(overlay.name)}</strong><p>${overlay.layout === 'alert' ? 'LIVE ALERT' : 'ICON GRID'}</p><p>${esc(overlay.gameTitle)} · ${esc(overlay.consoleName)}</p><code>${href}</code></div><div class="overlay-actions"><button class="copy-pipeline-url">Copy URL</button></div></article>`;
    list.querySelector('.copy-pipeline-url')?.addEventListener('click', async () => { await navigator.clipboard.writeText(href); });
  }
  async function create(event) {
    event.preventDefault(); event.stopImmediatePropagation(); recordFields();
    const game = games.find(item => item.id === saved.gameId); if (!game) { byId('game-select')?.focus(); return; }
    const button = byId('create-overlay'); button.disabled = true;
    try {
      const response = await fetch('/api/overlays', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        name: saved.name, layout: saved.layout,
        theme: { accent: saved['theme-accent'] || '#ffd34e', background: saved['theme-background'] || '#0d1119', opacity: saved['theme-opacity'] || '96', columns: saved['theme-columns'] || '10', soundVolume: saved['theme-volume'] || '70', soundFile: saved.soundFile || '' },
        gameId: game.id, gameTitle: game.title, gameIcon: game.icon, consoleName: game.consoleName
      }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Unable to create overlay.');
      renderCreated(result.overlay); button.textContent = 'Overlay created ✓'; setTimeout(() => { button.innerHTML = '<span>Create another overlay</span> <span>→</span>'; }, 1800);
    } catch (error) { alert(error.message || 'Unable to create overlay.'); }
    finally { button.disabled = false; }
  }
  async function loadGames() {
    try { const response = await fetch('/api/games'); const result = await response.json(); if (!response.ok) return; games = result.games || []; restore(); }
    catch { /* The normal dashboard already reports API errors. */ }
  }
  function setup() {
    const creator = document.querySelector('.creator'); if (!creator) return;
    const heading = creator.querySelector('.section-title h2'); if (heading) heading.textContent = 'Step 1 — Choose your game & overlay';
    const marker = creator.querySelector('.section-title > span'); if (marker) marker.textContent = 'SAVED ON THIS PC';
    const fieldset = creator.querySelector('.style-picker'); if (fieldset) fieldset.querySelector('legend').textContent = 'Step 2 — Choose what you want to create';
    document.querySelector('.customizer > p')?.replaceChildren('STEP 3 — PERSONALIZE');
    byId('create-overlay')?.addEventListener('click', create, true);
    for (const selector of ['#overlay-name', '#game-select', '#theme-accent', '#theme-background', '#theme-opacity', '#theme-columns', '#theme-volume']) document.querySelector(selector)?.addEventListener('input', recordFields);
    document.querySelectorAll('input[name="layout"]').forEach(input => input.addEventListener('change', recordFields));
    byId('theme-sound')?.addEventListener('change', async event => { try { await uploadSound(event.target.files?.[0]); } catch (error) { alert(error.message); } });
    new MutationObserver(restore).observe(byId('game-select'), { childList: true });
    restore(); loadGames();
  }
  document.addEventListener('DOMContentLoaded', () => setTimeout(setup, 0));
})();
