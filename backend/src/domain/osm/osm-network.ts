export interface OsmBounds {
  south: number;
  west: number;
  north: number;
  east: number;
}

export interface OsmCoordinate {
  lat: number;
  lon: number;
}

export interface OsmHighwayWay {
  id: number;
  nodes: number[];
  geometry: OsmCoordinate[];
  tags: Record<string, string>;
}

export interface OsmNetworkSnapshot {
  sourceTimestamp: string;
  importedAt: string;
  bounds: OsmBounds;
  ways: OsmHighwayWay[];
}

export function isOsmNetworkSnapshot(value: unknown): value is OsmNetworkSnapshot {
  if (typeof value !== 'object' || value === null) return false;

  const snapshot = value as Record<string, unknown>;
  return (
    typeof snapshot.sourceTimestamp === 'string' &&
    typeof snapshot.importedAt === 'string' &&
    isOsmBounds(snapshot.bounds) &&
    Array.isArray(snapshot.ways) &&
    snapshot.ways.every(isOsmHighwayWay)
  );
}

export function isOsmBounds(value: unknown): value is OsmBounds {
  if (typeof value !== 'object' || value === null) return false;

  const bounds = value as Record<string, unknown>;
  return (
    isFiniteNumber(bounds.south) &&
    isFiniteNumber(bounds.west) &&
    isFiniteNumber(bounds.north) &&
    isFiniteNumber(bounds.east)
  );
}

function isOsmHighwayWay(value: unknown): value is OsmHighwayWay {
  if (typeof value !== 'object' || value === null) return false;

  const way = value as Record<string, unknown>;
  return (
    isFiniteNumber(way.id) &&
    Array.isArray(way.nodes) &&
    way.nodes.every(isFiniteNumber) &&
    Array.isArray(way.geometry) &&
    way.geometry.every(isOsmCoordinate) &&
    typeof way.tags === 'object' &&
    way.tags !== null &&
    !Array.isArray(way.tags) &&
    Object.values(way.tags).every((tag) => typeof tag === 'string')
  );
}

function isOsmCoordinate(value: unknown): value is OsmCoordinate {
  if (typeof value !== 'object' || value === null) return false;

  const coordinate = value as Record<string, unknown>;
  return isFiniteNumber(coordinate.lat) && isFiniteNumber(coordinate.lon);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
