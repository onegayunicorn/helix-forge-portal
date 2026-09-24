# Contributing to Helix Forge Portal

See the backend [CONTRIBUTING.md](https://github.com/onegayunicorn/helix-forge/blob/main/CONTRIBUTING.md) for scientific integrity rules and the four concordance grading rules.

## Portal-specific notes

- Prefer the shared API client (`client/src/lib/api.ts`) over ad-hoc fetch calls.
- Always keep a fixture fallback so the PWA remains usable offline.
- Do not remove the research-safety messaging in the UI.
