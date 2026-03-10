# Contributing to postgis

Thank you for your interest in contributing! 🎉

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/postgis.git
   cd postgis
   ```
3. **Install** dependencies:
   ```bash
   npm install
   ```

## Development Workflow

```bash
npm run dev          # Build in watch mode
npm run test:watch   # Run tests in watch mode
npm run lint         # Lint the source
npm run format       # Format with Prettier
```

## Making Changes

- Create a new branch: `git checkout -b feat/my-feature`
- Write or update **tests** for your change (`__tests__/postgis.test.ts`)
- Ensure **all tests pass**: `npm test`
- Ensure **lint passes**: `npm run lint`
- Commit using [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat: add new spatial method`
  - `fix: handle invalid point format`
  - `docs: update API reference`
  - `chore: upgrade dependencies`

## Pull Request Guidelines

- Keep PRs focused on a **single change**
- Update the **CHANGELOG.md** under `[Unreleased]`
- Fill out the PR template completely
- All CI checks must pass before merging

## Reporting Bugs

Please use the [Bug Report](https://github.com/jsuyog2/postgis/issues/new?template=bug_report.md) template.

## Feature Requests

Please use the [Feature Request](https://github.com/jsuyog2/postgis/issues/new?template=feature_request.md) template.

## Security Issues

Please see [SECURITY.md](SECURITY.md) — **do not** open a public issue for security vulnerabilities.

## Code Style

- TypeScript strict mode — all code must be type-safe
- Prettier for formatting (config in `.prettierrc`)
- ESLint for linting (config in `eslint.config.mjs`)

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
