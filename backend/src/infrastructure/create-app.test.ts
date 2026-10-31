import { describe, expect, it } from 'bun:test';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createApp } from './create-app.ts';
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
          tags: { highway: 'residential', foot: 'no' },
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
    const repository: OsmNetworkRepository = {
      save: async () => {},
      load: async () => null,
    };
    const server = await startServer(repository);

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

  it('mounts the route endpoint', async () => {
    const server = await startServer();

    try {
      const response = await fetch(`${server.url}/route`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        message: 'Route endpoint received',
      });
    } finally {
      await stopServer(server.instance);
    }
  });
});

async function startServer(
  repository?: OsmNetworkRepository
): Promise<{ instance: Server; url: string }> {
  const instance = createApp(repository).listen(0);
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
