# Homepage

A quiet, static browser homepage for search, time, weather, and a few useful links.

Homepage is designed to stay small: no build step, no backend, no account, and no `config.json`. Settings are saved in the browser with `localStorage`.

## Features

- Search with Google, Bing, DuckDuckGo, YouTube, or Reddit.
- Pick which search engines are visible and choose a default.
- Switch between digital and analog clock styles.
- Show current weather through Open-Meteo, with no API key required.
- Add, edit, and remove quick links from the settings panel.
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
docker build -t homepage .
docker run --rm -p 8080:80 homepage
```

## Configuration

All configuration lives in browser storage under `homepage.settings.v1`.

Use the settings button in the top-right corner to edit:

- search engines
- default search engine
- clock style
- weather city and units
- quick links

If no weather city is saved, Homepage uses the browser timezone as a first guess.

## Files

- [index.html](./index.html) contains the app UI, styling, and behavior.
- [manifest.json](./manifest.json) defines install metadata.
- [favicon.svg](./favicon.svg) is the compact browser favicon.
- [assets/app-icon.svg](./assets/app-icon.svg) is the app icon.
- [assets/mask-icon.svg](./assets/mask-icon.svg) is the maskable icon.
- `assets/` contains local app and search engine SVG icons.
