import type { OsmDataSource } from '../../application/ports/outbound/osm-data-source.ts';
import type {
  OsmBounds,
  OsmCoordinate,
  OsmHighwayWay,
  OsmNetworkSnapshot,
} from '../../domain/osm/osm-network.ts';

interface OverpassResponse {
  osm3s: { timestamp_osm_base: string };
  elements: unknown[];
}

export class OverpassApiDataSource implements OsmDataSource {
  constructor(
    private readonly endpoint: string,
    private readonly now: () => Date = () => new Date(),
    private readonly fetcher: typeof fetch = fetch
  ) {}

  async fetchNetworkWays(bounds: OsmBounds): Promise<OsmNetworkSnapshot> {
    const query = buildNetworkQuery(bounds);
    const response = await this.fetcher(this.endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ data: query }),
      signal: AbortSignal.timeout(120_000),
    });

    if (!response.ok) {
      throw new Error(`Overpass request failed: ${response.status}`);
    }

    const payload: unknown = await response.json();
    const overpassResponse = parseOverpassResponse(payload);

    return {
      sourceTimestamp: overpassResponse.osm3s.timestamp_osm_base,
      importedAt: this.now().toISOString(),
      bounds,
      ways: overpassResponse.elements.map(parseHighwayWay),
    };
  }
}

const EXCLUDED_HIGHWAY_TYPES = [
  'motorway',
  'motorway_link',
  'construction',
  'proposed',
  'raceway',
];

function buildNetworkQuery(bounds: OsmBounds): string {
  return [
    '[out:json][timeout:120];',
    // Exclude freeway-type and non-existent ways; routing policy interprets the remaining access tags.
    `way["highway"]["highway"!~"^(${EXCLUDED_HIGHWAY_TYPES.join('|')})$"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});`,
    'out body geom;',
  ].join('\n');
}

function parseOverpassResponse(payload: unknown): OverpassResponse {
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('Overpass returned an invalid response');
  }

  const response = payload as Record<string, unknown>;
  if (
    typeof response.remark === 'string' ||
    typeof response.osm3s !== 'object' ||
    response.osm3s === null ||
    !Array.isArray(response.elements)
  ) {
    throw new Error(
      typeof response.remark === 'string'
        ? `Overpass query failed: ${response.remark}`
        : 'Overpass returned an invalid response'
    );
  }

  const metadata = response.osm3s as Record<string, unknown>;
  if (typeof metadata.timestamp_osm_base !== 'string') {
    throw new Error('Overpass response is missing its source timestamp');
  }

  return {
    osm3s: { timestamp_osm_base: metadata.timestamp_osm_base },
    elements: response.elements,
  };
}

function parseHighwayWay(value: unknown): OsmHighwayWay {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Overpass returned an invalid highway way');
  }

  const way = value as Record<string, unknown>;
  const tags = parseTags(way.tags);
  if (
    way.type !== 'way' ||
    !isFiniteNumber(way.id) ||
    !Array.isArray(way.nodes) ||
    !way.nodes.every(isFiniteNumber) ||
    !Array.isArray(way.geometry) ||
    !way.geometry.every(isCoordinate) ||
    typeof tags.highway !== 'string'
  ) {
    throw new Error('Overpass returned an incomplete highway way');
  }

  return {
    id: way.id,
    nodes: way.nodes,
    geometry: way.geometry.map((coordinate) => ({
      lat: coordinate.lat,
      lon: coordinate.lon,
    })),
    tags,
  };
}

function parseTags(value: unknown): Record<string, string> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Overpass returned a highway way without tags');
  }

  const tags = value as Record<string, unknown>;
  if (!Object.values(tags).every((tag) => typeof tag === 'string')) {
    throw new Error('Overpass returned invalid highway tags');
  }
  return tags as Record<string, string>;
}

function isCoordinate(value: unknown): value is OsmCoordinate {
  if (typeof value !== 'object' || value === null) return false;

  const coordinate = value as Record<string, unknown>;
  return isFiniteNumber(coordinate.lat) && isFiniteNumber(coordinate.lon);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
