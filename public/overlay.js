const card = document.querySelector("#overlay-card");
const help = document.querySelector("#overlay-help");
const { t } = window.RetroI18n;
let hideTimer;
let audioContext;
let customAudio;
function escapeHtml(value = "") { const div = document.createElement("div"); div.textContent = value; return div.innerHTML; }
function playUnlockSound(volume) {
  if (!volume) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    audioContext ||= new AudioContext();
    if (audioContext.state === "suspended") audioContext.resume();
    const now = audioContext.currentTime;
    [523.25, 659.25, 783.99].forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator(); const gain = audioContext.createGain();
      const start = now + index * 0.075; const level = (volume / 100) * 0.055;
      oscillator.type = "triangle"; oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.001, start); gain.gain.exponentialRampToValueAtTime(level, start + 0.018); gain.gain.exponentialRampToValueAtTime(0.001, start + 0.32);
      oscillator.connect(gain).connect(audioContext.destination); oscillator.start(start); oscillator.stop(start + 0.34);
    });
  } catch { /* Audio is optional in browser sources. */ }
}
function playAlertSound() {
  const volume = Number(overlay?.theme?.soundVolume ?? 70);
  const soundFile = overlay?.theme?.soundFile;
  if (!soundFile) { playUnlockSound(volume); return; }
  customAudio ||= new Audio();
  customAudio.src = `/api/sounds/${encodeURIComponent(soundFile)}`;
  customAudio.volume = Math.max(0, Math.min(1, volume / 100));
  customAudio.currentTime = 0;
  customAudio.play().catch(() => playUnlockSound(volume));
}
function show(achievement) {
  card.innerHTML = `<div class="achievement-glow"></div>${achievement.badgeUrl ? `<img src="${achievement.badgeUrl}" alt="" />` : "<div class=badge-placeholder>★</div>"}<div class="achievement-text"><p class="unlock-label">${t("achievementUnlocked")} ${achievement.hardcore ? "<span>HARDCORE</span>" : ""}</p><h3>${escapeHtml(achievement.title)}</h3><p>${escapeHtml(achievement.description)}</p><footer>${escapeHtml(achievement.gameTitle)} <i>•</i> ${achievement.points} pts <i>•</i> ${achievement.trueRatio}%</footer></div>`;
  card.className = "achievement-card overlay-card enter";
  playAlertSound();
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => card.classList.add("hidden"), 5000);
}
const overlayId = new URLSearchParams(location.search).get("id");
let overlay = null;
async function connect() {
  if (!overlayId) return;
  const response = await fetch(`/api/overlays/${encodeURIComponent(overlayId)}`);
  if (!response.ok) { help.textContent = t("overlayMissing"); return; }
  overlay = (await response.json()).overlay;
  card.style.setProperty("--alert-accent", overlay.theme.accent);
  card.style.setProperty("--alert-background", overlay.theme.background);
  card.style.setProperty("--alert-opacity", String((overlay.theme.opacity || 96) / 100));
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
