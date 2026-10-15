# STILL — A world to discover

A responsive, buildless image gallery made with HTML, CSS, and vanilla JavaScript.

## Run locally

Open `dist/index.html` in a modern browser, or serve the dist directory:

```sh
python -m http.server 8080 --directory dist
```

Then visit http://localhost:8080.

## Features

- 18 bundled photographs in a responsive masonry layout
- Nature, Architecture, Travel, and Abstract category filters
- Search by title, category, and keywords; press `/` to focus search
- Fullscreen lightbox with previous/next buttons, arrow keys, Home/End, swipe navigation, and Escape to close
- Saved favorites stored in the current browser with localStorage
- Comfortable and compact layouts, random discovery, and image downloads
- Keyboard focus handling, accessible control names, live result counts, and reduced-motion support

## Customize

Edit the `photos` array in `dist/app.js`. Add JPEG files to `dist/assets` with filenames matching each photo's `id`. Update category controls in `dist/index.html` when adding new categories. Colors and typography are defined at the top of `dist/styles.css`.

All photographs are bundled locally and were sourced from Unsplash. Image titles are editorial labels; no photographer attribution is implied. Google Fonts are loaded online, with local font fallbacks when offline. Favorites are specific to the current browser and origin.

No installation, build step, framework, backend, or account is needed to run the gallery locally.
