# RetroUnlock Live

Overlay RetroAchievements pour OBS. La clé API ne quitte jamais le serveur local.

## Démarrage

1. Copiez `.env.example` en `.env`.
2. Renseignez votre pseudo et votre clé RetroAchievements dans `.env`.
3. Lancez `npm start`.
4. Ouvrez `http://localhost:<PORT>`, puis copiez l’URL fournie dans une source **Navigateur** d’OBS. `PORT` vaut `3002` dans la configuration locale actuelle.

L’overlay est disponible à `http://localhost:<PORT>/overlay.html`.

Le service consulte l’endpoint officiel des succès récemment obtenus et envoie les nouvelles entrées au navigateur OBS via Server-Sent Events. L’intervalle par défaut est de 20 secondes, configurable avec `POLL_INTERVAL_MS` (minimum 15 secondes).
