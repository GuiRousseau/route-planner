import { describe, expect, it } from 'bun:test';
import type { OsmNetworkRepository } from '../ports/outbound/osm-network-repository.ts';
import { GetOsmNetwork } from './get-osm-network.ts';

describe('GetOsmNetwork', () => {
  it('returns the locally stored network', async () => {
    const snapshot = {
      sourceTimestamp: '2026-10-30T12:00:00Z',
      importedAt: '2026-10-31T12:00:00Z',
      bounds: { south: 46.65, west: -71.65, north: 47.05, east: -70.75 },
      ways: [],
    };
    const repository: OsmNetworkRepository = {
      save: async () => {},
      load: async () => snapshot,
    };

    await expect(new GetOsmNetwork(repository).execute()).resolves.toEqual(
      snapshot
    );
  });

  it('returns null when no local network has been imported', async () => {
    const repository: OsmNetworkRepository = {
      save: async () => {},
      load: async () => null,
    };

    await expect(new GetOsmNetwork(repository).execute()).resolves.toBeNull();
  });
});
