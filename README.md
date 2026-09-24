# Helix Forge Portal

Progressive Web App workspace for the Helix Forge DMD digital-twin workbench.

> **Research use only.** Not for clinical diagnosis.

## Quick start

```bash
pnpm install
# optional: point at a running FastAPI backend
echo 'VITE_API_BASE_URL=http://localhost:8000/api/v1' > .env.local
pnpm dev
```

Without a backend the UI falls back to synthetic fixtures automatically.

## API bridge

`client/src/lib/api.ts` talks to the Helix Forge FastAPI service:

- `POST /api/v1/evidence/concordance` → Evidence ledger
- `GET /api/v1/runs` → Sandbox runs
- `POST /api/v1/frame/compute` → exon click frame analysis
- `POST /api/v1/runs` → “Run verification” button

See the sibling repo [helix-forge](https://github.com/onegayunicorn/helix-forge) for the backend.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Vite dev server |
| `pnpm build` | Production build |
| `pnpm check` | TypeScript check |
