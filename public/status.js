(() => {
  let games = [];
  const text = (key, fallback) => window.RetroI18n?.t?.(key) || fallback;
  function render(info) {
    const dot = document.querySelector('#status-dot'); const title = document.querySelector('#status-title');
    const copy = document.querySelector('#status-copy'); const username = document.querySelector('#username');
    const interval = document.querySelector('#interval'); const path = document.querySelector('#config-location');
    if (!dot || !title || !copy) return;
    const connected = info.status === 'connected';
    dot.className = `status-dot ${connected ? 'ready' : info.status === 'error' ? 'error' : ''}`;
    title.textContent = connected ? text('ready', 'Connected') : info.status === 'error' ? 'API error' : text('configurationNeeded', 'Configuration required');
    copy.textContent = connected ? text('unlockSent', 'New unlocks will be sent to OBS.') : (info.message || text('configureHelp', 'Configure RetroAchievements to continue.'));
    if (username) username.textContent = info.username || '—';
    if (interval) interval.textContent = info.pollMs ? `${info.pollMs / 1000} s` : '—';
    if (path && info.localConfigPath) path.textContent = info.localConfigPath;
  }
  async function refresh() {
    try { const response = await fetch('/api/status', { cache: 'no-store' }); if (!response.ok) throw new Error(`HTTP ${response.status}`); render(await response.json()); }
    catch { render({ status: 'error', message: 'Local API unavailable. Restart RetroUnlock.' }); }
  }
  async function loadGames() {
    const select = document.querySelector('#game-select'); const state = document.querySelector('#games-state');
    if (!select) return;
    try {
      const response = await fetch('/api/games?refresh=1', { cache: 'no-store' }); const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load games');
      games = data.games || [];
      select.replaceChildren(new Option(text('selectGame', 'Choose a recent game'), ''));
      for (const game of games) select.add(new Option(`${game.title} — ${game.consoleName} (${game.achieved}/${game.total})`, String(game.id)));
      if (state) state.textContent = `${games.length} ${text('gamesAvailable', 'games available')}`;
    } catch (error) { if (state) state.textContent = error.message || text('loadGamesError', 'Unable to load games'); }
  }
  function configureApi() {
    const dialog = document.querySelector('#config-dialog'); const form = document.querySelector('#config-form');
    const error = document.querySelector('#config-error'); const open = document.querySelector('#configure-api');
    if (!dialog || !form || !open) return;
    open.addEventListener('click', () => { if (error) error.hidden = true; dialog.showModal(); document.querySelector('#config-username')?.focus(); });
    document.querySelector('#cancel-config')?.addEventListener('click', () => dialog.close());
    document.querySelector('.dialog-close')?.addEventListener('click', () => dialog.close());
    form.addEventListener('submit', async event => {
      event.preventDefault(); const username = document.querySelector('#config-username')?.value; const apiKey = document.querySelector('#config-api-key')?.value;
      try {
        const response = await fetch('/api/configuration', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, apiKey }) });
        const data = response.status === 204 ? {} : await response.json(); if (!response.ok) throw new Error(data.error || 'Unable to save configuration.');
        form.reset(); dialog.close(); await refresh(); await loadGames();
      } catch (caught) { if (error) { error.textContent = caught.message || 'Unable to save configuration.'; error.hidden = false; } }
    });
  }
  function createOverlay() {
    const button = document.querySelector('#create-overlay');
    if (!button) return;
    button.addEventListener('click', async event => {
      event.preventDefault(); event.stopImmediatePropagation();
      const gameId = Number(document.querySelector('#game-select')?.value); const game = games.find(item => item.id === gameId);
      if (!game) { document.querySelector('#game-select')?.focus(); return; }
      button.disabled = true;
      try {
        const selectedLayout = document.querySelector('input[name="layout"]:checked')?.value;
        const value = (selector, fallback) => document.querySelector(selector)?.value || fallback;
        const response = await fetch('/api/overlays', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
          name: value('#overlay-name', 'My Retro overlay'), layout: selectedLayout === 'alert' ? 'alert' : 'grid',
          theme: { accent: value('#theme-accent', '#ffd34e'), background: value('#theme-background', '#0d1119'), opacity: value('#theme-opacity', '96'), columns: value('#theme-columns', '10'), soundVolume: value('#theme-volume', '70'), soundFile: '' },
          gameId: game.id, gameTitle: game.title, gameIcon: game.icon, consoleName: game.consoleName
        }) });
        const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Unable to create the overlay.');
        const overlays = document.querySelector('#overlays'); const target = `${location.origin}/${data.overlay.layout === 'alert' ? 'overlay.html' : 'grid.html'}?id=${encodeURIComponent(data.overlay.id)}`;
        if (overlays) overlays.innerHTML = `<article class="overlay-row"><img src="${data.overlay.gameIcon}" alt=""><div><strong>${data.overlay.name}</strong><p>${data.overlay.gameTitle} · ${data.overlay.consoleName}</p><code>${target}</code></div><div class="overlay-actions"><button class="copy-overlay">Copy</button></div></article>`;
        overlays?.querySelector('.copy-overlay')?.addEventListener('click', async () => { await navigator.clipboard.writeText(target); });
      } catch (caught) { alert(caught.message || 'Unable to create the overlay.'); }
      finally { button.disabled = false; }
    }, true);
  }
  document.addEventListener('DOMContentLoaded', () => {
    refresh();
    loadGames();
    configureApi();
    createOverlay();
    const events = new EventSource('/api/events');
    events.addEventListener('status', event => { try { render(JSON.parse(event.data)); } catch {} });
    setInterval(refresh, 5000);
  });
})();
