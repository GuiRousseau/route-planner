import { describe, expect, it } from 'bun:test';
import type { OsmDataSource } from '../ports/outbound/osm-data-source.ts';
import type { OsmNetworkRepository } from '../ports/outbound/osm-network-repository.ts';
import { EnsureOsmNetwork } from './ensure-osm-network.ts';

const bounds = {
  south: 46.65,
  west: -71.65,
  north: 47.05,
  east: -70.75,
};

const snapshot = {
  sourceTimestamp: '2026-10-30T12:00:00Z',
  importedAt: '2026-10-31T12:00:00Z',
  bounds,
  ways: [],
};

describe('EnsureOsmNetwork', () => {
  it('imports data when no local snapshot exists', async () => {
    let savedSnapshot;
    const dataSource: OsmDataSource = {
      fetchNetworkWays: async () => snapshot,
    };
    const repository: OsmNetworkRepository = {
      save: async (network) => {
        savedSnapshot = network;
      },
      load: async () => null,
    };

    await expect(
      new EnsureOsmNetwork(dataSource, repository).execute(bounds)
    ).resolves.toEqual({ snapshot, imported: true });
    expect(savedSnapshot).toEqual(snapshot);
  });

  it('reuses existing local data instead of re-downloading during later builds', async () => {
    let fetchCalled = false;
    const dataSource: OsmDataSource = {
      fetchNetworkWays: async () => {
        fetchCalled = true;
        return snapshot;
      },
    };
    const repository: OsmNetworkRepository = {
      save: async () => {},
      load: async () => snapshot,
    };

    await expect(
      new EnsureOsmNetwork(dataSource, repository).execute(bounds)
    ).resolves.toEqual({ snapshot, imported: false });
    expect(fetchCalled).toBe(false);
  });
});
