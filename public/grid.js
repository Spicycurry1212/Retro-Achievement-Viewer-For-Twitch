const id = new URLSearchParams(location.search).get("id");
const card = document.querySelector("#grid-card");
const { t } = window.RetroI18n;

const legendStyle = document.createElement("style");
legendStyle.textContent = ".mode-legend{display:flex;gap:16px;margin:10px 0 0;font:12px Arial,sans-serif}.legend-hardcore{color:#ffd34e;text-shadow:0 0 6px #ffd34e88}.legend-softcore{color:#d6dde8;text-shadow:0 0 6px #d6dde888}";
document.head.append(legendStyle);

const esc = (value = "") => {
  const node = document.createElement("div");
  node.textContent = value;
  return node.innerHTML;
};

function scrollAchievements(viewport, initialSpeed) {
  const grid = viewport.firstElementChild;
  let frame;
  let lastTime;
  let position = 0;
  let direction = 1;
  let pauseLeft = 3000;
  let speed = initialSpeed;

  function step(now) {
    const overflow = viewport.scrollHeight - viewport.clientHeight;
    if (overflow <= 1) return;
    if (lastTime === undefined) lastTime = now;
    const elapsed = Math.min(now - lastTime, 250);
    lastTime = now;
    const movingTime = Math.max(0, elapsed - pauseLeft);
    pauseLeft = Math.max(0, pauseLeft - elapsed);
    position = Math.max(0, Math.min(overflow, position + direction * movingTime * speed / 1000));
    viewport.scrollTop = position;
    if (movingTime > 0 && position >= overflow) {
      direction = -1;
      pauseLeft = 2000;
    } else if (movingTime > 0 && position <= 0) {
      direction = 1;
      pauseLeft = 2000;
    }
    frame = requestAnimationFrame(step);
  }

  function restart() {
    cancelAnimationFrame(frame);
    lastTime = undefined;
    position = 0;
    direction = 1;
    pauseLeft = 3000;
    const columns = getComputedStyle(grid).gridTemplateColumns.split(/\s+/).length;
    const badge = grid.firstElementChild;
    if (badge && grid.children.length > columns) {
      const rowHeight = badge.getBoundingClientRect().height;
      const gap = parseFloat(getComputedStyle(grid).rowGap) || 0;
      viewport.style.maxHeight = `${Math.ceil(rowHeight * 1.5 + gap)}px`;
    } else {
      viewport.style.maxHeight = "";
    }

    const overflow = viewport.scrollHeight - viewport.clientHeight;
    if (overflow > 1) {
      viewport.scrollTop = 0;
      frame = requestAnimationFrame(step);
    } else {
      viewport.scrollTop = 0;
    }
  }

  const observer = new ResizeObserver(restart);
  observer.observe(viewport);
  observer.observe(viewport.firstElementChild);
  restart();
  return value => { speed = Math.max(4, Math.min(60, Number(value) || 14)); };
}

async function load() {
  if (!id) return;
  const force = new URLSearchParams(location.search).has("refresh");
  const response = await fetch(`/api/overlays/${encodeURIComponent(id)}/grid${force ? "?refresh=1" : ""}`);
  if (!response.ok) {
    card.textContent = t("loadGridError");
    return;
  }

  const { grid, overlay } = await response.json();
  const theme = overlay.theme;
  const visualKey = item => [item.gameId, item.theme.columns, item.theme.accent, item.theme.background, item.theme.opacity].join("|");
  const loadedVisualKey = visualKey(overlay);
  let observedSpeed = theme.scrollSpeed;
  const percent = grid.total ? Math.round(grid.earned / grid.total * 100) : 0;
  const next = grid.achievements.find(a => !a.earned);
  const style = document.createElement("style");
  style.textContent = `.grid-card{background:${theme.background}!important;border-color:${theme.accent}!important;opacity:${theme.opacity / 100}}.icons{grid-template-columns:repeat(${theme.columns || 10},minmax(0,1fr))!important}.grid-progress i{background:${theme.accent}!important}.icon.hardcore{border:2px solid #ffd34e!important;box-shadow:0 0 8px #ffd34e77!important}.icon.softcore{border:2px solid #c8d0dc!important;box-shadow:0 0 7px #c8d0dc66!important}.next-achievement{border-color:${theme.accent}!important}.next-achievement b{color:${theme.accent}!important}`;
  document.head.append(style);

  card.innerHTML = `<header><img src="${grid.icon}" alt=""><div><p>${t("progression")}</p><h1>${esc(grid.title)}</h1><strong>${grid.earned} <small>/ ${grid.total} ${t("achievements")}</small> <em>${percent}%</em></strong></div></header><div class="grid-progress"><i style="width:${percent}%"></i></div><div class="icons-viewport"><div class="icons">${grid.achievements.map(a => `<div class="icon ${a.earned ? (a.hardcore ? "hardcore" : "softcore") : "locked"}" title="${esc(a.title)}"><img src="${a.badgeUrl}" alt=""></div>`).join("")}</div></div><div class="mode-legend"><span class="legend-hardcore">● Hardcore</span><span class="legend-softcore">● Softcore</span></div>${next ? `<aside class="next-achievement"><img src="${next.badgeUrl}" alt=""><div><p>${t("nextAchievement")}</p><h2>${esc(next.title)} <b>+${next.points} pts</b></h2><span>${esc(next.description)}</span></div></aside>` : `<aside class="next-achievement"><div><p>${t("complete")}</p><h2>${t("allUnlocked")}</h2></div></aside>`}`;
  const setScrollSpeed = scrollAchievements(card.querySelector(".icons-viewport"), theme.scrollSpeed || 14);

  const stream = new EventSource("/api/events");
  const refreshGrid = event => {
    const payload = JSON.parse(event.data);
    if (Number(payload.gameId) === Number(overlay.gameId)) {
      stream.close();
      const nextUrl = new URL(location.href);
      nextUrl.searchParams.set("refresh", Date.now().toString());
      setTimeout(() => location.replace(nextUrl), 900);
    }
  };
  stream.addEventListener("unlock", refreshGrid);
  stream.addEventListener("grid-refresh", refreshGrid);
  stream.addEventListener("overlay-updated", event => {
    if (JSON.parse(event.data).id === overlay.id) location.reload();
  });
  stream.addEventListener("overlay-settings", event => {
    const settings = JSON.parse(event.data);
    if (settings.id === overlay.id) {
      observedSpeed = settings.scrollSpeed;
      setScrollSpeed(observedSpeed);
    }
  });
  // OBS can miss an event when its browser source reconnects. Check saved settings too.
  setInterval(async () => {
    try {
      const response = await fetch(`/api/overlays/${encodeURIComponent(overlay.id)}`, { cache: "no-store" });
      if (!response.ok) return;
      const current = (await response.json()).overlay;
      if (visualKey(current) !== loadedVisualKey) { location.reload(); return; }
      if (current.theme.scrollSpeed !== observedSpeed) {
        observedSpeed = current.theme.scrollSpeed;
        setScrollSpeed(observedSpeed);
      }
    } catch { /* Retry when the Companion becomes available. */ }
  }, 5000);
}

load();
