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

    expect(route.distanceMeters).toBeGreaterThan(4000);
    expect(route.distanceMeters).toBeLessThan(6000);
    expect(route.waypoints[0]).toEqual(route.waypoints.at(-1));
    expect(route.waypoints.length).toBeGreaterThan(10);
  });

  it('avoids retracing the outbound path when an alternative exists', async () => {
    const generator = await OsmRouteGenerator.create(repositoryOf(gridSnapshot()), () => 0.5);
    const route = await generator.execute(start);
    const keys = route.waypoints.map((p) => `${p.lat},${p.lon}`);
    const unique = new Set(keys);

    expect(unique.size).toBeGreaterThan(keys.length * 0.6);
  });

  it('ignores ways that are not runnable', async () => {
    const snapshot = gridSnapshot(5);
    snapshot.ways.forEach((way) => (way.tags = { highway: 'motorway' }));

    await expect(OsmRouteGenerator.create(repositoryOf(snapshot))).rejects.toBeInstanceOf(
      RouteNetworkNotAvailableError
    );
  });

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
