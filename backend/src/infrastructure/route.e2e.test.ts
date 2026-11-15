import { describe, expect, it } from 'bun:test';
import { mkdtemp, rmdir, unlink, writeFile } from 'node:fs/promises';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { FileOsmNetworkRepository } from '../adapters/outbound/file-osm-network-repository.ts';
import { createApp } from './create-app.ts';

describe('POST /route end-to-end', () => {
  it('returns the route response generated from a stored OSM snapshot', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'route-planner-e2e-'));
    const filePath = join(directory, 'network.json');
    const startPoint = { lat: 0, lon: 0 };
    const turnaround = { lat: 0, lon: 0.0225 };
    const snapshot = {
      sourceTimestamp: '2026-10-30T12:00:00Z',
      importedAt: '2026-10-31T12:00:00Z',
      bounds: { south: -1, west: -1, north: 1, east: 1 },
      ways: [{
        id: 1,
        nodes: [1, 2],
        geometry: [startPoint, turnaround],
        tags: { highway: 'residential' },
      }],
    };

    try {
      await writeFile(filePath, JSON.stringify(snapshot));
      const app = await createApp(new FileOsmNetworkRepository(filePath));
      const server = app.listen(0);

      try {
        await new Promise<void>((resolve) => server.once('listening', resolve));
        const address = server.address() as AddressInfo;
        const response = await fetch(`http://127.0.0.1:${address.port}/route`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ startPoint }),
        });

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('application/json');
        expect(await response.json()).toEqual({
          distanceMeters: 5004,
          targetDistanceMeters: 5000,
          waypoints: [startPoint, turnaround, startPoint],
        });
      } finally {
        await new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
        });
      }
    } finally {
      await unlink(filePath).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== 'ENOENT') throw error;
      });
      await rmdir(directory);
    }
  });
});
