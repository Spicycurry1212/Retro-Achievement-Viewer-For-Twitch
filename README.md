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

## Quick start

### Requirements

- [Node.js](https://nodejs.org/) 20 or newer
- A RetroAchievements username and Web API key
- OBS Studio (optional, for streaming)

### Install

```bash
git clone https://github.com/YOUR-USERNAME/retrounlock-live.git
cd retrounlock-live
copy .env.example .env
npm start
```

Open `http://localhost:3000` (or the port set in `.env`) to create an overlay.

### Configure `.env`

```env
RA_USERNAME=YourRetroAchievementsUsername
RA_API_KEY=your_api_key_here
POLL_INTERVAL_MS=10000
PORT=3000
```

`POLL_INTERVAL_MS` controls how often new achievements are checked. Ten seconds is a responsive default while avoiding excessive API calls.

## Add an overlay to OBS

1. Open RetroUnlock Live and create an overlay for a game.
2. Copy the OBS URL displayed for that overlay.
3. In OBS, add **Sources → + → Browser**.
4. Paste the URL, choose the desired dimensions, then confirm.
5. Keep RetroUnlock Live running while streaming.

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
