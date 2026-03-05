# Lightnovel Crawler — Web

[![Lint & Build](https://github.com/lncrawl/lncrawl-web/actions/workflows/build.yml/badge.svg)](https://github.com/lncrawl/lncrawl-web/actions/workflows/build.yml)
[![DeepWiki](https://img.shields.io/badge/DeepWiki-lncrawl%2Flncrawl--web-blue.svg?logo=deepwiki)](https://deepwiki.com/lncrawl/lncrawl-web)

Web UI for [**Lightnovel Crawler**](https://github.com/lncrawl/lightnovel-crawler): browse sources, queue crawl jobs, manage libraries, and read novels in the browser. Installable as a PWA for a native-like experience.

## Prerequisites

- **Node.js** (LTS) — use the version in [.nvmrc](.nvmrc) if you use nvm
- **Yarn**
- **API** — the backend must be running for the web app to work (see [Lightnovel Crawler](https://github.com/lncrawl/lightnovel-crawler))

## Getting started

```bash
# Install dependencies
yarn install

# Run development server (default: http://localhost:5173)
yarn dev

# Type-check and build for production
yarn build

# Run ESLint
yarn lint
```

Build output is written to **`dist/`** by default (see `vite.config.ts` for `outDir` and chunk splitting).

## Configuration

In development, the app talks to the API at **`http://localhost:8080`**.
Start the backend there or adjust the base URL.

API base URL is set in [src/config.ts](src/config.ts):

- **Development** — `http://localhost:8080`
- **Production** — empty string (same origin; serve the built app from the same host as the API)

## Tech stack

| Layer     | Choice                                         |
| --------- | ---------------------------------------------- |
| Runtime   | Node.js (LTS)                                  |
| Framework | React 19                                       |
| Build     | Vite, TypeScript                               |
| UI        | Ant Design                                     |
| State     | Redux Toolkit, Redux Persist                   |
| Routing   | React Router                                   |
| PWA       | vite-plugin-pwa (auto-update, offline support) |

## Project structure

| Path              | Purpose                                              |
| ----------------- | ---------------------------------------------------- |
| `src/`            | React app (entry, styles, types)                     |
| `src/pages/`      | Route-level pages and [router](src/pages/router.tsx) |
| `src/components/` | Reusable UI, layout, reader, and shared components   |
| `src/store/`      | Redux store and slices                               |
| `src/utils/`      | Helpers, theme, axios setup                          |
| `src/config.ts`   | API base URL and app config                          |
| `vite.config.ts`  | Vite config (PWA, build output, aliases)             |

## PWA

The app is a Progressive Web App:

- **Installable** — Add to home screen on supported browsers
- **Auto-update** — New versions are applied when available (no manual refresh)
- **Offline** — Cached assets for repeat visits

Icons and manifest are configured in [vite.config.ts](vite.config.ts) via `vite-plugin-pwa`.

## CI

The [.github/workflows/build.yml](.github/workflows/build.yml) workflow runs on push and pull requests. It:

1. Installs dependencies (with Yarn cache)
2. Runs `yarn lint` and `yarn build`
3. Uploads the build output as a **web-build** artifact

Download the artifact from the Actions run summary to get the production `dist/` bundle.

## Donations

Donations help keep the project running. See [DONATIONS.md](DONATIONS.md) for details.

## License

This project is licensed under the **GNU General Public License v3.0**. See [LICENSE](LICENSE) for the full text.
