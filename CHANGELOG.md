# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2026-03-10

### Added
- Full **TypeScript** support — all source files migrated to `src/` with strict typings
- **Dual ESM + CJS** build output via `tsup` — tree-shakable and bundler-friendly
- `src/types/index.ts` — exported interfaces for all method options and return types
- `src/utils/validation.ts` — shared `parsePoint()` helper and typed assertion guards
- `src/utils/logger.ts` — structured debug logger (enabled via `POSTGIS_DEBUG=true`)
- **Vitest** test runner replacing Jest — same API, native ESM support, faster execution
- `vitest.config.ts` with v8 coverage provider
- `tsup.config.ts` for production-ready dual bundle generation
- `.prettierrc` — Prettier code formatting config
- `.editorconfig` — cross-editor indentation and line ending consistency
- `.npmignore` — reduces install footprint by excluding `src/`, tests, and docs
- `LICENSE` file (MIT)
- `CONTRIBUTING.md` — fork, branch, commit, and PR guidelines
- `CODE_OF_CONDUCT.md` — Contributor Covenant 2.1
- `SECURITY.md` — private vulnerability disclosure process and SQL injection warning
- `CHANGELOG.md` — this file
- GitHub Actions `ci.yml` — lint + test + build on every push/PR
- GitHub Actions `docs.yml` — VitePress docs auto-deploy to GitHub Pages
- GitHub Actions `publish.yml` — npm + GitHub Packages publish on release
- VitePress documentation site under `docs/`
- `examples/` directory with basic usage, GeoJSON export, and MVT server examples
- Expanded npm keywords for better discoverability

### Changed
- `intersect_point`, `nearest`, and `transform_point` now throw a descriptive `Error`
  with message `"Invalid point format ..."` instead of crashing with a `TypeError`
- `_executeQuery` return is now `res.rows ?? []` — no more fragile fallback chain
- `package.json` `license` corrected from `ISC` → `MIT`
- Updated `package.json` with `exports`, `types`, `sideEffects: false`, `files` whitelist,
  `engines`, `funding`, and expanded `keywords`
- `eslint.config.mjs` upgraded to include `typescript-eslint` rules

### Fixed
- License mismatch between `package.json` (ISC) and README (MIT) — now consistently MIT

## [1.0.6] - 2025-01-15

### Added
- Initial public release
- `list_tables`, `list_columns`, `query_table`
- `bbox`, `centroid`
- `intersect_feature`, `intersect_point`
- `geojson`, `geobuf`, `mvt`
- `nearest`, `transform_point`
- Jest test suite with mocked pg.Client

[unreleased]: https://github.com/jsuyog2/postgis/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/jsuyog2/postgis/compare/v1.0.6...v1.2.0
[1.0.6]: https://github.com/jsuyog2/postgis/releases/tag/v1.0.6
