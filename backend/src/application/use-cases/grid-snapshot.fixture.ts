import type { OsmNetworkSnapshot } from '../../domain/osm/osm-network.ts';

const STEP = 0.0009; // roughly 100 m

// 25x25 street grid around lat 46.8 / lon -71.2 (node id = row * 100 + col).
export function gridSnapshot(size = 25): OsmNetworkSnapshot {
  const origin = { lat: 46.8 - (STEP * (size - 1)) / 2, lon: -71.2 - (STEP * (size - 1)) / 2 };
  const point = (row: number, col: number) => ({
    lat: origin.lat + row * STEP,
    lon: origin.lon + col * STEP,
  });
  const id = (row: number, col: number) => row * 100 + col;
  const ways: OsmNetworkSnapshot['ways'] = [];

  for (let row = 0; row < size; row++) {
    const cols = [...Array(size).keys()];
    ways.push({
      id: 1000 + row,
      nodes: cols.map((col) => id(row, col)),
      geometry: cols.map((col) => point(row, col)),
      tags: { highway: 'residential' },
    });
  }
  for (let col = 0; col < size; col++) {
    const rows = [...Array(size).keys()];
    ways.push({
      id: 2000 + col,
      nodes: rows.map((row) => id(row, col)),
      geometry: rows.map((row) => point(row, col)),
      tags: { highway: 'residential' },
    });
  }

  return {
    sourceTimestamp: '2026-10-30T12:00:00Z',
    importedAt: '2026-10-31T12:00:00Z',
    bounds: { south: 46.7, west: -71.3, north: 46.9, east: -71.1 },
    ways,
  };
}
