# Install RetroUnlock Twitch Overlay (Windows)

This guide explains how to install RetroUnlock Companion, connect it to your RetroAchievements account, and add your overlay to OBS.

> **Your RetroAchievements API key is private.** Never send it to another person, paste it in a Discord message, put it in an OBS URL, or share a screenshot showing it.

## What you need

- A Windows PC
- OBS Studio
- A RetroAchievements account
- RetroUnlock Companion download

## 1. Download the Companion

1. Download the `RetroUnlock Companion` ZIP file from the official release page.
2. Right-click the ZIP file and select **Extract All…**.
3. Extract it somewhere permanent, for example `C:\Apps\RetroUnlock Companion`.
4. Open the extracted folder.
5. Double-click `RetroUnlock Companion.exe`.

Keep all files from the extracted folder together. Do not move only the `.exe` file.

Windows may show a SmartScreen notice for an unsigned early release. Only continue if you downloaded the file from the official RomHackPatcher release page.

## 2. Get your RetroAchievements API key

1. Log in to [RetroAchievements](https://retroachievements.org/).
2. Open your [Control Panel](https://retroachievements.org/controlpanel.php).
3. Find the **Keys** section.
4. Copy your **Web API Key**.

Treat this key like a password. RetroUnlock does not need you to give it to the website, Discord, or another person.

## 3. Configure the Companion

1. In the Companion window, open the top menu: **RetroUnlock → Open configuration folder**.
2. Open the `.env` file with Notepad.
3. Fill in only the two empty values below. Keep the names on the left unchanged:

```env
RETROACHIEVEMENTS_API_KEY=PASTE_YOUR_PRIVATE_KEY_HERE
RETROACHIEVEMENTS_USERNAME=YourRetroAchievementsUsername
POLL_INTERVAL_MS=10000
PORT=3000
```

4. Save the file.
5. Close and reopen RetroUnlock Companion.

`POLL_INTERVAL_MS=10000` means that the app checks for new unlocks every 10 seconds. Do not lower this value.

## 4. Create an overlay

1. In RetroUnlock Companion, select one of your recent games.
2. Choose an overlay type:
   - **Icon Grid**: game progress and achievement icons.
   - **Live Alert**: a popup when an achievement unlocks.
3. Pick your colours, opacity, and number of columns.
4. Click **Create my overlay**.
5. Copy the OBS link displayed on the overlay card.

## 5. Add it to OBS

1. Open OBS and select the scene where the overlay should appear.
2. In **Sources**, click **+**.
3. Select **Browser** and click **OK**.
4. Give it a name, such as `RetroUnlock Grid`.
5. Paste the copied overlay URL into the **URL** field.
6. Suggested sizes:
   - Icon Grid: `1100 × 750`
   - Live Alert: `800 × 250`
7. Click **OK**, then move and resize the overlay in your OBS preview.

Leave RetroUnlock Companion open while you stream. The overlay uses your local Companion, so it must remain running to check for new achievements.

## 6. Test before going live

Use **Test animation** inside RetroUnlock Companion. If the Browser Source is configured correctly, the test alert appears in OBS immediately.

## Troubleshooting

### My game list is empty

- Confirm that your RetroAchievements username is spelled exactly right in `.env`.
- Confirm that your Web API key is complete and has no spaces.
- Save `.env`, close the Companion completely, and start it again.

### OBS shows a blank page

- Make sure RetroUnlock Companion is still open.
- Copy the overlay URL again and replace the URL in the OBS Browser Source.
- Click **Refresh cache of current page** in the Browser Source properties.

### I think I exposed my API key

Generate a new key from the RetroAchievements Control Panel immediately, then replace only the local value in `.env`.
