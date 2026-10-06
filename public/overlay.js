const card = document.querySelector("#overlay-card");
const help = document.querySelector("#overlay-help");
const { t } = window.RetroI18n;
let hideTimer;
function escapeHtml(value = "") { const div = document.createElement("div"); div.textContent = value; return div.innerHTML; }
function show(achievement) {
  card.innerHTML = `<div class="achievement-glow"></div>${achievement.badgeUrl ? `<img src="${achievement.badgeUrl}" alt="" />` : "<div class=badge-placeholder>★</div>"}<div class="achievement-text"><p class="unlock-label">${t("achievementUnlocked")} ${achievement.hardcore ? "<span>HARDCORE</span>" : ""}</p><h3>${escapeHtml(achievement.title)}</h3><p>${escapeHtml(achievement.description)}</p><footer>${escapeHtml(achievement.gameTitle)} <i>•</i> ${achievement.points} pts <i>•</i> ${achievement.trueRatio}%</footer></div>`;
  card.className = "achievement-card overlay-card enter";
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => card.classList.add("hidden"), 9000);
}
const overlayId = new URLSearchParams(location.search).get("id");
let overlay = null;
async function connect() {
  if (!overlayId) return;
  const response = await fetch(`/api/overlays/${encodeURIComponent(overlayId)}`);
  if (!response.ok) { help.textContent = t("overlayMissing"); return; }
  overlay = (await response.json()).overlay;
  help.remove();
  const events = new EventSource("/api/events");
  const showAlert = event => {
    const achievement = JSON.parse(event.data);
    if (overlay.gameId === null || overlay.gameId === achievement.gameId) show(achievement);
  };
  const showTestAlert = event => show(JSON.parse(event.data));
  events.addEventListener("unlock", showAlert);
  events.addEventListener("test-unlock", showTestAlert);
}
connect();
