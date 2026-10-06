# RetroUnlock Live

**RetroAchievements overlays for OBS — live unlock alerts, completion progress, and achievement icon grids.**

RetroUnlock Live is a small self-hosted companion app for streamers. Choose one of your recent RetroAchievements games, create an overlay, and add its unique browser-source URL to OBS.

> This is an independent community project and is not affiliated with RetroAchievements.

## Features

- Live achievement alerts for OBS
- Achievement icon grid with progress bar, locked icons, point values, and the next achievement to unlock
- Hardcore and softcore completion indicators (gold and silver borders)
- Multiple overlays and games per profile
- Custom accent colour, card background, opacity, and grid column count
- Live updates using Server-Sent Events after the configured check interval
- Local-first design: your RetroAchievements API key stays in your `.env` file and is never sent to a public frontend

## Setup guide (Windows)

### Before you begin

You need:

- [Node.js](https://nodejs.org/) 20 or newer — install the **LTS** version.
- A RetroAchievements account.
- Your RetroAchievements **Web API key** from your account settings.
- OBS Studio, if you want to use the overlays while streaming.

### 1. Download the project

On GitHub, click **Code → Download ZIP**. Extract the ZIP somewhere simple, for example `C:\RetroUnlock-Live`.

Alternatively, if you use Git:

```powershell
git clone https://github.com/YOUR-USERNAME/retrounlock-live.git
cd retrounlock-live
```

### 2. Create your private configuration file

Open the project folder. Copy `.env.example` and rename the copy to `.env`.

Open `.env` in Notepad and fill in your details:

```env
RETROACHIEVEMENTS_USERNAME=YourRetroAchievementsUsername
RETROACHIEVEMENTS_API_KEY=paste_your_private_api_key_here
POLL_INTERVAL_MS=10000
PORT=3000
```

Do **not** share, commit, or upload `.env`. It contains your private API key and is already ignored by Git.

`POLL_INTERVAL_MS=10000` checks for unlocks every 10 seconds. You can increase it if you prefer fewer checks.

### 3. Start RetroUnlock Live

In the project folder, right-click and choose **Open in Terminal**. Run:

```powershell
npm start
```

Leave that terminal window open while you stream. When it says the server is ready, open:

```text
http://localhost:3000
```

If you chose a different `PORT` in `.env`, replace `3000` with that number.

### 4. Create your overlay

1. In RetroUnlock Live, pick one of your recent RetroAchievements games.
2. Choose **Icon Grid** for progress or **Live Alert** for achievement popups.
3. Adjust the colours, opacity, and number of columns.
4. Click **Create my overlay**.
5. Copy the OBS URL shown on the new overlay card.

## Add an overlay to OBS

1. In OBS, open the scene where you want the overlay.
2. Under **Sources**, click **+** then select **Browser**.
3. Name it, for example `RetroAchievements Grid`, and click **OK**.
4. Paste the copied overlay URL into the **URL** field.
5. For an icon grid, begin with **1100 × 750**. For an alert, try **800 × 250**.
6. Enable **Refresh browser when scene becomes active** if you want OBS to reload it when changing scenes.
7. Click **OK**, move and resize the source in OBS, then keep RetroUnlock Live running while you stream.

To test it, use the **Test animation** button in RetroUnlock Live. It should appear immediately in OBS.

The icon grid automatically refreshes when a new unlock is detected. The alert overlay appears when the local service detects the unlock during its next check.

## Security and publishing this repository

Your real API key must only exist in your local `.env` file:

- `.env` is ignored by Git and must never be committed.
- Use `.env.example` as the template for contributors.
- Never put API keys in browser JavaScript, screenshots, issues, or public config files.
- If a key is ever pasted publicly, regenerate it in RetroAchievements before using the app again.

This repository can be public as long as the rules above are followed. For a hosted multi-user version, each user's API key should remain in a locally installed companion app rather than being collected by the website.

## Project status

This is an early prototype under active development. Feedback and issues are welcome.

## License

No license has been selected yet. Do not reuse or redistribute the code until a license is added.
