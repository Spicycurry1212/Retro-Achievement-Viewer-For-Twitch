# RetroUnlock Live

<p align="center">
  <strong>RetroAchievements overlays made for OBS.</strong><br />
  Live unlock alerts, persistent achievement grids, and a local-first Companion for streamers.
</p>

<p align="center">
  <a href="#get-started">Get started</a> &nbsp;•&nbsp;
  <a href="#see-it-in-action">Product tour</a> &nbsp;•&nbsp;
  <a href="INSTALLATION.md">Windows installation</a>
</p>

> [!TIP]
> Your RetroAchievements API key stays on your own PC. RetroUnlock Live runs locally and gives OBS a private browser-source URL.

## See it in action

### Your stream dashboard

<p align="center">
  <img src="docs/images/dashboard.png" alt="RetroUnlock Live dashboard showing a connected streamer profile" width="900" />
</p>

Connect once, pick a recent game, then create as many grid or alert overlays as your scenes need.

<table>
  <tr>
    <td width="50%" valign="top">
      <strong>1. Build an overlay</strong><br />
      Choose a game, a layout, colours, opacity, grid columns, and an optional local alert sound.<br /><br />
      <img src="docs/images/create-overlay.png" alt="Overlay creator with game selection and customisation controls" width="100%" />
    </td>
    <td width="50%" valign="top">
      <strong>2. Bring it into OBS</strong><br />
      Paste the generated local URL into an OBS Browser source. The grid and alert update while you stream.<br /><br />
      <img src="docs/images/obs-browser-source.png" alt="RetroUnlock overlay displayed in OBS" width="100%" />
    </td>
  </tr>
</table>

## How it works

| 1. Connect | 2. Personalise | 3. Stream |
| --- | --- | --- |
| Configure the local Companion with your RetroAchievements account. | Select a game and create an icon grid or a live alert in seconds. | Add its URL as an OBS Browser source and let it refresh automatically. |

<a id="get-started"></a>

**Ready to try it?** Follow the [complete Windows installation guide](INSTALLATION.md).

> This is an independent community project and is not affiliated with RetroAchievements.

## Features

- Live achievement alerts for OBS
- Achievement icon grid with progress bar, locked icons, point values, and the next achievement to unlock
- Hardcore and softcore completion indicators (gold and silver borders)
- Multiple overlays and games per profile
- Custom accent colour, card background, opacity, and grid column count
- Live updates using Server-Sent Events after the configured check interval
- Server-side caching for game lists and achievement grids, with instant grid invalidation after a detected unlock
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

## Windows Companion build

RetroUnlock Live can also be packaged as a Windows desktop application. The desktop version starts the local service and opens the dashboard automatically.

```powershell
npm install
npm run build:win
```

The Windows executable is created in the build output folder. Its private `.env` and overlay data are stored in the Windows user profile, outside the application folder and outside Git. This means an update or a reinstall does not place the API key inside the downloadable application.

The first time the Companion starts, open **RetroUnlock → Open configuration folder**, edit the generated `.env`, then restart the app.

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
