(() => {
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
  document.addEventListener('DOMContentLoaded', () => {
    refresh();
    const events = new EventSource('/api/events');
    events.addEventListener('status', event => { try { render(JSON.parse(event.data)); } catch {} });
    setInterval(refresh, 5000);
  });
})();
