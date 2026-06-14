# Haku

Zen homepage.

Haku is designed to stay small: no build step, no backend, no account, and no `config.json`. Settings are saved in the browser with `localStorage`.

## Features

- Search with general engines, media/community search, and developer/reference targets.
- Show online search suggestions while typing when the active provider allows browser requests.
- Use slash prefixes such as `/yt cats`, `/gh haku`, or `/wiki zen` to search a specific engine.
- Press `Alt+1` through `Alt+9`, or letter shortcuts like `Alt+G` and `Alt+Y`, to switch between visible search engines.
- View active keyboard shortcuts from the settings panel.
- Pick which search engines are visible and choose a default.
- Drag search engines in settings to reorder the search picker.
- Add custom search engines with a `{query}` URL template.
- Navigate the search engine picker with arrow keys, Enter, and Escape.
- Switch between digital and manual clock styles.
- Choose a theme. The default `Ink` theme is neutral black, white, and gray; optional themes are more distinct.
- Show or hide current weather and condition through Open-Meteo, with no API key required.
- Add, edit, and remove quick links from the settings panel. New installs start with no default links.
- Drag quick links in settings to reorder them.
- Install metadata through `site.webmanifest`.
- Chrome and Firefox extension manifests for using Haku as a new tab page.
- Local SVG icons under `assets/`.

## Run Locally

Open [index.html](./index.html) directly in a browser.

You can also serve the directory with any static server:

```sh
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Browser Extensions

Build unpacked extension folders:

```sh
sh scripts/build-extensions.sh
```

The script writes:

- `dist/chrome/` for Chrome, Chromium, Brave, and Edge.
- `dist/firefox/` for Firefox.

Load the Chrome build from `chrome://extensions` with Developer mode enabled and "Load unpacked".

Load the Firefox build from `about:debugging#/runtime/this-firefox` with "Load Temporary Add-on" and select `dist/firefox/manifest.json`.

The extension replaces the browser new tab page with Haku. Settings are still saved locally in that browser profile.

## Docker

The included Dockerfile serves the app with nginx:

```sh
docker build -t haku .
docker run --rm -p 8080:80 haku
```

## Configuration

All configuration lives in browser storage under `haku.settings.v3`.

Use the settings button in the top-right corner to edit:

- search engines
- custom search engines
- default search engine
- online search suggestions
- optional local search history
- clock style
- date and time formats
- background theme
- weather visibility, city, and units
- quick links

Reset asks for confirmation before clearing browser-stored settings.

If no weather city is saved, Haku uses the browser timezone as a first guess.

## Files

- [index.html](./index.html) contains the app markup.
- [styles.css](./styles.css) contains the app styling.
- [app.js](./app.js) contains the app behavior.
- [site.webmanifest](./site.webmanifest) defines website install metadata.
- `extension/` contains browser extension manifests.
- `scripts/build-extensions.sh` builds unpacked extension folders.
- [favicon.svg](./favicon.svg) is the compact browser favicon.
- `assets/` contains local app and search engine SVG icons.
