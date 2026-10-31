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

## Import OpenStreetMap data

The backend build initializes a local OSM snapshot from Overpass if one is not already present. The data is not re-downloaded on subsequent builds. To refresh it explicitly, from the repository root run:

```bash
bun run --cwd backend import:osm
```

The refresh command uses a bounding box covering the Quebec City region and writes `backend/data/osm/quebec-city.json` when run from the backend working directory. Configure `OSM_BBOX` as `south,west,north,east`, `MAP_DATA_FILE` as an absolute path or a path relative to the process working directory, and `OSM_OVERPASS_ENDPOINT` to use a different extraction area, storage location, or Overpass-compatible endpoint. The import is not run on server startup.

The snapshot retains every OSM way tagged `highway` in the selected area except motorways and unusable ways (`motorway`, `motorway_link`, `construction`, `proposed`, `raceway`)—paths and trails, sidewalk-tagged roads, `trunk` roads (some are walkable; routing should check their `foot` tag), and roads with no pedestrian-access tags—along with its OSM ID, ordered node IDs, coordinates, and all tags (including `foot`, `access`, `sidewalk`, and `surface`). The importer does not otherwise filter by assumed pedestrian suitability: later routing policy can prefer paths and sidewalks, exclude explicit restrictions, and decide how to treat unknown access. The generated `backend/data/` folder is gitignored. Backend code can read the stored snapshot through the `OsmNetworkRepository` port; `GET /map-data` provides the same snapshot over HTTP after import. A missing snapshot returns `404`. The repository currently uses atomic local JSON-file replacement, and can be replaced without changing the use cases.

The default bounding box is an approximate regional rectangle, not a municipal boundary. Use `OSM_BBOX` to adjust the coverage; include a buffer around the area where routes will be generated. OSM tags can be incomplete, so an absent access tag must not automatically be interpreted as either permission or prohibition. Public Overpass instances are shared services; avoid frequent or large repeated imports. For public use, display OpenStreetMap attribution and identify the ODbL license as shown in the frontend.

## Notes

- The backend port is fixed at `3000` (`backend/src/server.ts`); no environment variables are required.
- The frontend doesn't call the API yet; when it does, add a Vite proxy or use the full backend URL.
