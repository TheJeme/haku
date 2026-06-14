# Haku

A quiet, static browser homepage for search, time, weather, and a few useful links.

Haku is designed to stay small: no build step, no backend, no account, and no `config.json`. Settings are saved in the browser with `localStorage`.

## Features

- Search with general engines, media/community search, and developer/reference targets.
- Use slash prefixes such as `/yt cats`, `/gh haku`, or `/wiki zen` to search a specific engine.
- Press `Alt+1` through `Alt+9`, or letter shortcuts like `Alt+G` and `Alt+Y`, to switch between visible search engines.
- Pick which search engines are visible and choose a default.
- Drag search engines in settings to reorder the search picker.
- Add custom search engines with a `{query}` URL template.
- Navigate the search engine picker with arrow keys, Enter, and Escape.
- Switch between digital and manual clock styles.
- Choose a theme. The default `Ink` theme is neutral black, white, and gray; optional themes are more distinct.
- Show current weather and condition through Open-Meteo, with no API key required.
- Add, edit, and remove quick links from the settings panel. New installs start with no default links.
- Drag quick links in settings to reorder them.
- Install metadata through `manifest.json`.
- Local SVG icons under `assets/`.

## Run Locally

Open [index.html](./index.html) directly in a browser.

You can also serve the directory with any static server:

```sh
python -m http.server 8080
```

Then open `http://localhost:8080`.

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
- clock style
- background theme
- weather city and units
- quick links

Reset asks for confirmation before clearing browser-stored settings.

If no weather city is saved, Haku uses the browser timezone as a first guess.

## Files

- [index.html](./index.html) contains the app UI, styling, and behavior.
- [manifest.json](./manifest.json) defines install metadata.
- [favicon.svg](./favicon.svg) is the compact browser favicon.
- [assets/app-icon.svg](./assets/app-icon.svg) is the app icon.
- [assets/mask-icon.svg](./assets/mask-icon.svg) is the maskable icon.
- `assets/` contains local app and search engine SVG icons.
