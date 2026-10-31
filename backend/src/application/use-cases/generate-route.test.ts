import { describe, expect, it } from 'bun:test';
import {
  GenerateRoute,
  OsmNetworkNotAvailableError,
  RouteNotFoundError,
} from './generate-route.ts';
import { gridSnapshot } from './grid-snapshot.fixture.ts';
import type { OsmNetworkSnapshot } from '../../domain/osm/osm-network.ts';

const repositoryOf = (snapshot: OsmNetworkSnapshot | null) => ({
  save: async () => {},
  load: async () => snapshot,
});
const start = { lat: 46.8, lon: -71.2 };

describe('GenerateRoute', () => {
  it('builds a round trip of about 5 km that starts and ends at the same node', async () => {
    const route = await new GenerateRoute(repositoryOf(gridSnapshot()), () => 0.5).execute(start);

    expect(route.distanceMeters).toBeGreaterThan(4000);
    expect(route.distanceMeters).toBeLessThan(6000);
    expect(route.waypoints[0]).toEqual(route.waypoints.at(-1));
    expect(route.waypoints.length).toBeGreaterThan(10);
  });

  it('avoids retracing the outbound path when an alternative exists', async () => {
    const route = await new GenerateRoute(repositoryOf(gridSnapshot()), () => 0.5).execute(start);
    const keys = route.waypoints.map((p) => `${p.lat},${p.lon}`);
    const unique = new Set(keys);

    expect(unique.size).toBeGreaterThan(keys.length * 0.6);
  });

  it('ignores ways that are not runnable', async () => {
    const snapshot = gridSnapshot(5);
    snapshot.ways.forEach((way) => (way.tags = { highway: 'motorway' }));

    await expect(new GenerateRoute(repositoryOf(snapshot)).execute(start)).rejects.toBeInstanceOf(
      RouteNotFoundError
    );
  });

  it('fails when the start point is far from any way', async () => {
    await expect(
      new GenerateRoute(repositoryOf(gridSnapshot())).execute({ lat: 10, lon: 10 })
    ).rejects.toBeInstanceOf(RouteNotFoundError);
  });

  it('fails when no OSM network was imported', async () => {
    await expect(new GenerateRoute(repositoryOf(null)).execute(start)).rejects.toBeInstanceOf(
      OsmNetworkNotAvailableError
    );
  });
});
