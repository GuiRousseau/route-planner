import { describe, expect, it } from 'bun:test';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createApp } from './create-app.ts';
import { gridSnapshot } from '../application/use-cases/grid-snapshot.fixture.ts';
import type { OsmNetworkRepository } from '../application/ports/outbound/osm-network-repository.ts';

describe('createApp', () => {
  it('serves the locally stored OSM network for later route planning', async () => {
    const snapshot = {
      sourceTimestamp: '2026-10-30T12:00:00Z',
      importedAt: '2026-10-31T12:00:00Z',
      bounds: { south: 46.65, west: -71.65, north: 47.05, east: -70.75 },
      ways: [
        {
          id: 123,
          nodes: [1, 2],
          geometry: [
            { lat: 46.8, lon: -71.2 },
            { lat: 46.81, lon: -71.21 },
          ],
          tags: { highway: 'residential' },
        },
      ],
    };
    const repository: OsmNetworkRepository = {
      save: async () => {},
      load: async () => snapshot,
    };
    const server = await startServer(repository);

    try {
      const response = await fetch(`${server.url}/map-data`);

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(snapshot);
    } finally {
      await stopServer(server.instance);
    }
  });

  it('reports when the OSM network has not been imported', async () => {
    let available = true;
    const repository: OsmNetworkRepository = {
      save: async () => {},
      load: async () => available ? gridSnapshot() : null,
    };
    const server = await startServer(repository);
    available = false;

    try {
      const response = await fetch(`${server.url}/map-data`);

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({
        error: 'OSM network has not been imported yet',
      });
    } finally {
      await stopServer(server.instance);
    }
  });

  it('refuses to start without a network or with an unreadable network', async () => {
    await expect(createApp({ save: async () => {}, load: async () => null }))
      .rejects.toThrow('OSM network has not been imported yet');
    await expect(createApp({
      save: async () => {},
      load: async () => { throw new Error('Invalid snapshot'); },
    })).rejects.toThrow('Invalid snapshot');
  });

  it('refuses to start when the network has no usable edges', async () => {
    const snapshot = gridSnapshot();
    snapshot.ways.forEach((way) => (way.tags = { highway: 'motorway' }));
    await expect(createApp({ save: async () => {}, load: async () => snapshot }))
      .rejects.toThrow('OSM network has no runnable edges');
  });

  it('generates a round-trip route from the stored OSM network', async () => {
    const repository: OsmNetworkRepository = {
      save: async () => {},
      load: async () => gridSnapshot(),
    };
    const server = await startServer(repository);

    try {
      const response = await fetch(`${server.url}/route`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ startPoint: { lat: 46.8, lon: -71.2 } }),
      });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.targetDistanceMeters).toBe(5000);
      expect(body.distanceMeters).toBeGreaterThanOrEqual(4500);
      expect(body.distanceMeters).toBeLessThanOrEqual(5500);
      expect(body.waypoints[0]).toEqual(body.waypoints.at(-1));
    } finally {
      await stopServer(server.instance);
    }
  });

  it('returns 422 when it cannot generate a route within the target distance', async () => {
    const server = await startServer({
      save: async () => {},
      load: async () => gridSnapshot(5),
    });

    try {
      const response = await fetch(`${server.url}/route`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ startPoint: { lat: 46.8, lon: -71.2 } }),
      });

      expect(response.status).toBe(422);
      expect(await response.json()).toEqual({
        error: 'Could not generate a route within the target distance',
      });
    } finally {
      await stopServer(server.instance);
    }
  });

  it('rejects invalid route input', async () => {
    const server = await startServer();

    try {
      for (const body of [
        {},
        { startPoint: null },
        { startPoint: { lat: '46.8', lon: -71.2 } },
        { startPoint: { lat: 90.01, lon: 0 } },
        { startPoint: { lat: 0, lon: -180.01 } },
      ]) {
        const response = await fetch(`${server.url}/route`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        });

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({
          error: 'Request body must contain a startPoint with numeric lat and lon',
        });
      }
    } finally {
      await stopServer(server.instance);
    }
  });

  it('accepts coordinates at the geographic boundaries', async () => {
    const server = await startServer();

    try {
      for (const startPoint of [{ lat: 90, lon: 180 }, { lat: -90, lon: -180 }]) {
        const response = await fetch(`${server.url}/route`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ startPoint }),
        });
        expect(response.status).toBe(422);
      }
    } finally {
      await stopServer(server.instance);
    }
  });

  it('uses the initialized routing graph without reloading the network', async () => {
    let available = true;
    const server = await startServer({
      save: async () => {},
      load: async () => available ? gridSnapshot() : null,
    });
    available = false;

    try {
      const response = await fetch(`${server.url}/route`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ startPoint: { lat: 46.8, lon: -71.2 } }),
      });

      expect(response.status).toBe(200);
    } finally {
      await stopServer(server.instance);
    }
  });
});

async function startServer(
  repository?: OsmNetworkRepository
): Promise<{ instance: Server; url: string }> {
  const instance = (await createApp(repository ?? {
    save: async () => {},
    load: async () => gridSnapshot(),
  })).listen(0);
  await new Promise<void>((resolve) => instance.once('listening', resolve));
  const address = instance.address() as AddressInfo;

  return {
    instance,
    url: `http://127.0.0.1:${address.port}`,
  };
}

async function stopServer(instance: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    instance.close((error) => (error ? reject(error) : resolve()));
  });
}
