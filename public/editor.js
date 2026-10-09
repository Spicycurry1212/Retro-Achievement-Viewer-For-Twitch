const editSubmit = document.querySelector("#create-overlay");
const createSubmit = editSubmit.onclick;
const creator = document.querySelector(".creator");
const creatorLabel = creator.querySelector(".section-title .label");
const creatorTitle = creator.querySelector(".section-title h2");
let editingOverlay = null;

const editActions = document.createElement("div");
editActions.className = "edit-actions";
editSubmit.parentNode.insertBefore(editActions, editSubmit);
editActions.append(editSubmit);
const cancelEdit = document.createElement("button");
cancelEdit.type = "button";
cancelEdit.className = "ghost";
cancelEdit.textContent = t("cancel");
cancelEdit.hidden = true;
editActions.append(cancelEdit);
const editNote = document.createElement("p");
editNote.className = "edit-note";
editNote.setAttribute("role", "status");
editActions.after(editNote);

const removeSoundLabel = document.createElement("label");
removeSoundLabel.className = "remove-sound";
removeSoundLabel.innerHTML = `<input type="checkbox" id="remove-custom-sound"> ${t("removeSound")}`;
removeSoundLabel.hidden = true;
document.querySelector("#theme-sound").closest("label").after(removeSoundLabel);
removeSoundLabel.remove();

function ensureEditingGame() {
  if (!editingOverlay) return;
  const select = document.querySelector("#game-select");
  if (!Array.from(select.options).some(option => Number(option.value) === Number(editingOverlay.gameId))) {
    const option = new Option(`${editingOverlay.gameTitle} — ${editingOverlay.consoleName}`, editingOverlay.gameId);
    select.add(option);
  }
  if (!select.value) select.value = String(editingOverlay.gameId);
}

window.addEventListener("retrounlock-games-loaded", ensureEditingGame);

function stopEditing(message = "") {
  editingOverlay = null;
  creator.classList.remove("editing");
  creatorLabel.textContent = t("newOverlay");
  creatorTitle.textContent = t("createScene");
  editSubmit.innerHTML = `${t("createOverlay")} <span>→</span>`;
  editSubmit.onclick = createSubmit;
  cancelEdit.hidden = true;
  removeSoundLabel.remove();
  document.querySelector("#remove-custom-sound").checked = false;
  document.querySelectorAll('input[name="layout"]').forEach(input => { input.disabled = false; });
  editNote.textContent = message;
}

cancelEdit.onclick = () => stopEditing();

async function saveEditedOverlay() {
  if (!editingOverlay) return;
  const selectedId = Number(document.querySelector("#game-select").value);
  const game = games.find(item => Number(item.id) === selectedId) ||
    (selectedId === Number(editingOverlay.gameId) ? {
      id: editingOverlay.gameId,
      title: editingOverlay.gameTitle,
      icon: editingOverlay.gameIcon,
      consoleName: editingOverlay.consoleName
    } : null);
  if (!game) { document.querySelector("#game-select").focus(); return; }
  editSubmit.disabled = true;
  editNote.textContent = "";
  try {
    const uploadedSound = await uploadSelectedSound();
    const soundFile = uploadedSound || (removeSoundLabel.isConnected && document.querySelector("#remove-custom-sound").checked ? "" : editingOverlay.theme.soundFile);
    const input = {
      name: document.querySelector("#overlay-name").value,
      layout: editingOverlay.layout,
      gameId: game.id,
      gameTitle: game.title,
      gameIcon: game.icon,
      consoleName: game.consoleName,
      theme: {
        accent: document.querySelector("#theme-accent").value,
        background: document.querySelector("#theme-background").value,
        opacity: document.querySelector("#theme-opacity").value,
        columns: document.querySelector("#theme-columns").value,
        scrollSpeed: document.querySelector("#theme-scroll-speed").value,
        soundVolume: document.querySelector("#theme-volume").value,
        soundFile
      }
    };
    const response = await fetch(`/api/overlays/${encodeURIComponent(editingOverlay.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || t("editSaveFailed"));
    document.querySelector("#theme-sound").value = "";
    stopEditing(t("changesSaved"));
    await loadOverlays();
  } catch (error) {
    editNote.textContent = error.message || t("editSaveFailed");
  } finally {
    editSubmit.disabled = false;
  }
}

document.querySelector("#overlays").addEventListener("click", async event => {
  const button = event.target.closest(".edit-overlay");
  if (!button) return;
  const response = await fetch(`/api/overlays/${encodeURIComponent(button.dataset.id)}`);
  if (!response.ok) { editNote.textContent = t("editSaveFailed"); return; }
  editingOverlay = (await response.json()).overlay;
  const theme = editingOverlay.theme;
  creator.classList.add("editing");
  creatorLabel.textContent = t("editOverlay");
  creatorTitle.textContent = editingOverlay.name;
  editSubmit.innerHTML = `${t("saveChanges")} <span>→</span>`;
  editSubmit.onclick = saveEditedOverlay;
  cancelEdit.hidden = false;
  editNote.textContent = t("keepObsLink");
  document.querySelector("#overlay-name").value = editingOverlay.name;
  ensureEditingGame();
  document.querySelector("#game-select").value = String(editingOverlay.gameId);
  document.querySelector("#game-select").dispatchEvent(new Event("change"));
  document.querySelector("#layout-select").value = editingOverlay.layout;
  document.querySelector(`#${editingOverlay.layout}-layout`).checked = true;
  document.querySelectorAll('input[name="layout"]').forEach(input => { input.disabled = true; });
  document.querySelector("#theme-accent").value = theme.accent;
  document.querySelector("#theme-background").value = theme.background;
  document.querySelector("#theme-opacity").value = theme.opacity;
  document.querySelector("#opacity-value").textContent = `${theme.opacity}%`;
  const columns = document.querySelector("#theme-columns");
  if (!Array.from(columns.options).some(option => option.value === String(theme.columns))) {
    columns.add(new Option(String(theme.columns), String(theme.columns)));
  }
  columns.value = String(theme.columns);
  document.querySelector("#theme-scroll-speed").value = theme.scrollSpeed;
  document.querySelector("#scroll-speed-value").textContent = `${theme.scrollSpeed} px/s`;
  document.querySelector("#theme-volume").value = theme.soundVolume;
  document.querySelector("#volume-value").textContent = `${theme.soundVolume}%`;
  document.querySelector("#theme-sound").value = "";
  document.querySelector("#remove-custom-sound").checked = false;
  if (editingOverlay.layout === "alert" && theme.soundFile) {
    removeSoundLabel.hidden = false;
    document.querySelector("#theme-sound").closest("label").after(removeSoundLabel);
  } else {
    removeSoundLabel.remove();
  }
  document.querySelector("#theme-columns").dispatchEvent(new Event("input"));
  creator.scrollIntoView({ behavior: "smooth", block: "start" });
});
