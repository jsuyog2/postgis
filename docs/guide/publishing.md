# Publishing Guide

Step-by-step guide to publish `postgis` to npm and deploy the docs to GitHub Pages.

## 1. Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Name it `postgis`, add a description, choose **Public**
3. Do **not** initialize with README (you already have one)

## 2. Push Your Project

```bash
git init
git add .
git commit -m "chore: initial commit"
git remote add origin https://github.com/jsuyog2/postgis.git
git branch -M main
git push -u origin main
```

## 3. Configure CI Secrets

In your GitHub repo → **Settings → Secrets and variables → Actions**:

| Secret | Value |
|---|---|
| `NPM_TOKEN` | Your npm access token (`npm token create`) |
| `CODECOV_TOKEN` | From [codecov.io](https://codecov.io) |

## 4. Enable GitHub Pages

1. Go to **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: `gh-pages` / `/ (root)`
4. The `docs.yml` workflow will create the `gh-pages` branch on first push to `main`

## 5. Publish to npm

On the first publish, run:

```bash
npm login
npm publish --access public
```

For subsequent releases, create a GitHub Release — the `publish.yml` workflow handles everything automatically.

## 6. Create a Release

1. Bump version: `npm version patch|minor|major`
2. Update `CHANGELOG.md` — move `[Unreleased]` items under the new version
3. Push: `git push && git push --tags`
4. Create a GitHub Release at [github.com/jsuyog2/postgis/releases/new](https://github.com/jsuyog2/postgis/releases/new)
5. The CI/CD pipeline publishes automatically

## 7. Add Repository Badges

Add these to the top of `README.md`:

```markdown
[![npm version](https://img.shields.io/npm/v/postgis.svg)](https://www.npmjs.com/package/postgis)
[![npm downloads](https://img.shields.io/npm/dm/postgis.svg)](https://www.npmjs.com/package/postgis)
[![Build Status](https://github.com/jsuyog2/postgis/actions/workflows/ci.yml/badge.svg)](https://github.com/jsuyog2/postgis/actions/workflows/ci.yml)
[![Coverage](https://codecov.io/gh/jsuyog2/postgis/branch/main/graph/badge.svg)](https://codecov.io/gh/jsuyog2/postgis)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```

## 8. Add GitHub Topics

In your repo → **About (gear icon)** → Add topics:

`postgis`, `postgresql`, `geospatial`, `nodejs`, `gis`, `geojson`, `mvt`, `typescript`, `spatial`
