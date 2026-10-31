import { isAbsolute, resolve } from 'node:path';
import type { OsmBounds } from '../domain/osm/osm-network.ts';

const DEFAULT_BOUNDS: OsmBounds = {
  south: 46.65,
  west: -71.65,
  north: 47.05,
  east: -70.75,
};

const DEFAULT_OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter';
const DEFAULT_MAP_DATA_FILE = 'data/osm/quebec-city.json';

export interface OsmConfig {
  overpassEndpoint: string;
  bounds: OsmBounds;
  mapDataFile: string;
}

export function loadOsmConfig(
  environment: NodeJS.ProcessEnv = process.env
): OsmConfig {
  const overpassEndpoint =
    environment.OSM_OVERPASS_ENDPOINT ?? DEFAULT_OVERPASS_ENDPOINT;
  const endpointUrl = new URL(overpassEndpoint);
  if (endpointUrl.protocol !== 'https:' && endpointUrl.protocol !== 'http:') {
    throw new Error('OSM_OVERPASS_ENDPOINT must use HTTP or HTTPS');
  }

  const configuredFile = environment.MAP_DATA_FILE ?? DEFAULT_MAP_DATA_FILE;

  return {
    overpassEndpoint,
    bounds: environment.OSM_BBOX
      ? parseBounds(environment.OSM_BBOX)
      : DEFAULT_BOUNDS,
    mapDataFile: isAbsolute(configuredFile)
      ? configuredFile
      : resolve(process.cwd(), configuredFile),
  };
}

function parseBounds(value: string): OsmBounds {
  const values = value.split(',').map(Number);
  if (values.length !== 4 || !values.every(Number.isFinite)) {
    throw new Error('OSM_BBOX must be south,west,north,east');
  }

  const [south, west, north, east] = values;
  if (
    south === undefined ||
    west === undefined ||
    north === undefined ||
    east === undefined ||
    south < -90 ||
    north > 90 ||
    west < -180 ||
    east > 180 ||
    south >= north ||
    west >= east
  ) {
    throw new Error('OSM_BBOX must describe valid south,west,north,east bounds');
  }

  return { south, west, north, east };
}
