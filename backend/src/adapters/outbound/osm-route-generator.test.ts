import { describe, expect, it } from 'bun:test';
import { OsmRouteGenerator } from './osm-route-generator.ts';
import {
  RouteNetworkNotAvailableError,
  RouteNotFoundError,
} from '../../application/ports/inbound/route-generator.ts';
import { gridSnapshot } from '../../application/use-cases/grid-snapshot.fixture.ts';
import type { OsmNetworkSnapshot } from '../../domain/osm/osm-network.ts';

const repositoryOf = (snapshot: OsmNetworkSnapshot | null) => ({
  save: async () => {},
  load: async () => snapshot,
});
const start = { lat: 46.8, lon: -71.2 };

describe('OsmRouteGenerator', () => {
  it('builds a round trip of about 5 km that starts and ends at the same node', async () => {
    const generator = await OsmRouteGenerator.create(repositoryOf(gridSnapshot()), () => 0.5);
    const route = await generator.execute(start);

    expect(route.distanceMeters).toBeGreaterThanOrEqual(4500);
    expect(route.distanceMeters).toBeLessThanOrEqual(5500);
    expect(route.waypoints[0]).toEqual(route.waypoints.at(-1));
    expect(route.waypoints.length).toBeGreaterThan(10);
  });

  it('avoids retracing the outbound path when an alternative exists', async () => {
    const generator = await OsmRouteGenerator.create(repositoryOf(gridSnapshot()), () => 0.5);
    const route = await generator.execute(start);
    const keys = route.waypoints.map((p) => `${p.lat},${p.lon}`);
    const unique = new Set(keys);

    expect(unique.size).toBeGreaterThan(keys.length * 0.6);
    expect(route.distanceMeters).toBeGreaterThanOrEqual(4500);
    expect(route.distanceMeters).toBeLessThanOrEqual(5500);
  });

  it('retraces the outbound path when the preferred alternative exceeds the distance limit', async () => {
    const snapshot = loopSnapshot([
      { lat: 0.04, lon: 0 },
      { lat: 0.04, lon: 0.0225 },
    ]);
    const generator = await OsmRouteGenerator.create(repositoryOf(snapshot), () => 0);
    const route = await generator.execute({ lat: 0, lon: 0 });

    expect(route.waypoints).toEqual([
      { lat: 0, lon: 0 },
      { lat: 0, lon: 0.0225 },
      { lat: 0, lon: 0 },
    ]);
    expect(route.distanceMeters).toBe(5004);
  });

  it('prefers an alternative return path when it stays within the distance limit', async () => {
    const via = { lat: 0.004, lon: 0.01125 };
    const generator = await OsmRouteGenerator.create(repositoryOf(loopSnapshot([via])), () => 0);
    const route = await generator.execute({ lat: 0, lon: 0 });

    expect(route.waypoints).toEqual([
      { lat: 0, lon: 0 },
      { lat: 0, lon: 0.0225 },
      via,
      { lat: 0, lon: 0 },
    ]);
    expect(route.distanceMeters).toBeGreaterThanOrEqual(4500);
    expect(route.distanceMeters).toBeLessThanOrEqual(5500);
  });

  it('reports when no turnaround can produce the target distance', async () => {
    const generator = await OsmRouteGenerator.create(repositoryOf(gridSnapshot(5)));
    await expect(generator.execute(start)).rejects.toBeInstanceOf(RouteNotFoundError);
  });

  it('ignores ways that are not runnable', async () => {
    const snapshot = gridSnapshot(5);
    snapshot.ways.forEach((way) => (way.tags = { highway: 'motorway' }));

    await expect(OsmRouteGenerator.create(repositoryOf(snapshot))).rejects.toBeInstanceOf(
      RouteNetworkNotAvailableError
    );
  });

  function loopSnapshot(via: Array<{ lat: number; lon: number }>): OsmNetworkSnapshot {
    const start = { lat: 0, lon: 0 };
    const turnaround = { lat: 0, lon: 0.0225 };
    return {
      sourceTimestamp: '2026-10-30T12:00:00Z',
      importedAt: '2026-10-31T12:00:00Z',
      bounds: { south: -1, west: -1, north: 1, east: 1 },
      ways: [
        { id: 1, nodes: [1, 2], geometry: [start, turnaround], tags: { highway: 'residential' } },
        {
          id: 2,
          nodes: [1, ...via.map((_, index) => index + 3), 2],
          geometry: [start, ...via, turnaround],
          tags: { highway: 'residential' },
        },
      ],
    };
  }

  it('fails when the start point is far from any way', async () => {
    const generator = await OsmRouteGenerator.create(repositoryOf(gridSnapshot()));
    await expect(generator.execute({ lat: 10, lon: 10 })).rejects.toBeInstanceOf(RouteNotFoundError);
  });

  it('fails when no OSM network was imported', async () => {
    await expect(OsmRouteGenerator.create(repositoryOf(null))).rejects.toBeInstanceOf(
      RouteNetworkNotAvailableError
    );
  });

  it('loads the network only during initialization and reuses the graph', async () => {
    let loads = 0;
    const generator = await OsmRouteGenerator.create({
      save: async () => {},
      load: async () => {
        loads++;
        if (loads > 1) throw new Error('Unexpected reload');
        return gridSnapshot();
      },
    }, () => 0.5);
    const first = await generator.execute(start);
    const second = await generator.execute(start);
    expect(first.distanceMeters).toBeGreaterThan(4000);
    expect(second).toEqual(first);
    expect(loads).toBe(1);
  });
});
