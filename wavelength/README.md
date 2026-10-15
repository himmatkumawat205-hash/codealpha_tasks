# Wavelength

A responsive music player built with HTML, CSS, and plain JavaScript. No build step or installed dependencies are required.

## Run locally

Open `dist/index.html` in a modern browser, or run `npm start` with Node.js 22+ and open http://127.0.0.1:5173. Deploy the contents of `dist/` to any static web host.

## Features

- Play, pause, previous, next, seek, volume and mute.
- Track title, artist, collection, real duration and elapsed time.
- Six original 48-second instrumental demos with original SVG covers.
- Search, mood filters, favorites, built-in collections, and custom playlists.
- Shuffle, repeat all, repeat one, and autoplay next track.
- Import local audio files; names in `Artist - Title.ext` format are split automatically. Actual embedded tags are not parsed.
- Keyboard controls and operating-system media controls when supported.
- Responsive desktop, tablet and mobile layouts; accessible labels and reduced-motion support.

Favorites, custom playlists (bundled tracks), volume, repeat and autoplay preferences persist in browser local storage. Imported audio is never uploaded. Imported files and their playlist entries last for the current page session and need to be selected again after closing or reloading the page. Browser format support varies; MP3 and WAV are broadly supported. Playback begins after the user presses Play; autoplay means continuing to the next track after playback has begun. On repeat-off, playback stops at the end of the queue. The Previous control restarts the current track after three seconds; pressing it near the start goes back a track.

The audio demos were synthesized specifically for this project by `generate-assets.mjs` and are not recordings by commercial artists. All demo artist credits use the project name Wavelength Studio. Album artwork is original SVG. Fonts use Google Fonts with system fallbacks; the bundled player and audio work without external asset services.

## Files

- `dist/index.html`: semantic interface and icon symbols
- `dist/styles.css`: responsive design and motion
- `dist/app.js`: player state and interactions
- `dist/assets/`: bundled audio, covers, favicon
- `generate-assets.mjs`: reproducible audio and artwork generator
- `server.mjs`: local preview server with audio byte-range support

Keyboard: Space plays/pauses, left/right selects previous/next, M mutes, / focuses search, and ? opens shortcut help. Standard control keyboard behavior is preserved while using inputs, buttons and dialogs.
