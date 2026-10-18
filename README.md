# route-planner
Project to plan routes in advance and suggest potential routes for future runs.

## Structure

This is a [Bun](https://bun.sh) workspace monorepo:

| Package | Path | Stack | Default URL |
|---|---|---|---|
| Frontend | `frontend/` | React 18 + Vite + TypeScript | http://localhost:5173 |
| Backend | `backend/` | Express + TypeScript (hexagonal architecture) | http://localhost:3000 |

## Prerequisites

- [Bun](https://bun.sh) (scripts and lockfile are Bun-based)

## Install

From the repository root:

```bash
bun install
```

## Run in development

Start both apps from the root:

```bash
bun run dev
```

Or start them separately in two terminals:

```bash
bun run dev:backend    # API on http://localhost:3000
bun run dev:frontend   # UI on http://localhost:5173
```

Verify the backend is up:

```bash
curl http://localhost:3000/healthcheck
```

## Build and run for production

```bash
bun run build            # builds frontend (Vite) and backend (bun build -> backend/dist)
bun run start:backend    # runs backend/dist/server.js on port 3000
bun run start:frontend   # previews the built frontend (vite preview)
```

> `start:frontend` uses `vite preview`, which is meant for local previewing, not production hosting.

## Test and type-check (backend)

```bash
bun run --cwd backend test
bun run --cwd backend type-check
```

## Notes

- The backend port is fixed at `3000` (`backend/src/server.ts`); no environment variables are required.
- The frontend doesn't call the API yet; when it does, add a Vite proxy or use the full backend URL.
