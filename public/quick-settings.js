const overlayList = document.querySelector("#overlays");
const pendingThemeSaves = new Map();

async function updateSavedTheme(id, changes) {
  const previous = pendingThemeSaves.get(id) || Promise.resolve();
  const next = previous.catch(() => {}).then(async () => {
    const path = `/api/overlays/${encodeURIComponent(id)}`;
    const currentResponse = await fetch(path, { cache: "no-store" });
    if (!currentResponse.ok) throw new Error(t("quickSaveFailed"));
    const { overlay } = await currentResponse.json();
    const response = await fetch(path, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...overlay, theme: { ...overlay.theme, ...changes } })
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error || t("quickSaveFailed"));
    }
    await loadOverlays();
  });
  pendingThemeSaves.set(id, next);
  try { await next; }
  finally { if (pendingThemeSaves.get(id) === next) pendingThemeSaves.delete(id); }
}

async function uploadSavedSound(file) {
  if (file.size > 5 * 1024 * 1024) throw new Error(t("soundTooLarge"));
  const type = file.type || ({ mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg" })[file.name.split(".").pop().toLowerCase()];
  if (!["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/ogg"].includes(type)) throw new Error(t("soundFormatError"));
  const data = await readFileAsDataUrl(file);
  const response = await fetch("/api/sounds", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, data })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || t("quickSaveFailed"));
  return result.soundFile;
}

overlayList.addEventListener("input", event => {
  const control = event.target.closest(".saved-theme-control[type=range]");
  if (!control) return;
  control.nextElementSibling.textContent = `${control.value}${control.dataset.setting === "cardWidth" ? " px" : "%"}`;
});

overlayList.addEventListener("change", async event => {
  const control = event.target.closest(".saved-theme-control, .saved-sound-file");
  if (!control) return;
  control.disabled = true;
  try {
    if (control.matches(".saved-sound-file")) {
      const file = control.files[0];
      if (!file) return;
      await updateSavedTheme(control.dataset.id, { soundFile: await uploadSavedSound(file) });
    } else {
      const setting = control.dataset.setting;
      const allowed = ["columns", "visibleRows", "cardWidth", "accent", "background", "opacity", "soundVolume"];
      if (!allowed.includes(setting)) return;
      await updateSavedTheme(control.dataset.id, { [setting]: control.type === "color" ? control.value : Number(control.value) });
    }
  } catch (error) {
    alert(error.message || t("quickSaveFailed"));
    await loadOverlays();
  } finally { control.disabled = false; }
});

overlayList.addEventListener("click", async event => {
  const button = event.target.closest(".remove-saved-sound");
  if (!button) return;
  button.disabled = true;
  try { await updateSavedTheme(button.dataset.id, { soundFile: "" }); }
  catch (error) { alert(error.message || t("quickSaveFailed")); await loadOverlays(); }
  finally { button.disabled = false; }
});
