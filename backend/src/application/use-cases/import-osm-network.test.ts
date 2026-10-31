import { describe, expect, it } from 'bun:test';
import type { OsmDataSource } from '../ports/outbound/osm-data-source.ts';
import type { OsmNetworkRepository } from '../ports/outbound/osm-network-repository.ts';
import { ImportOsmNetwork } from './import-osm-network.ts';

describe('ImportOsmNetwork', () => {
  it('stores the road network returned for the configured area', async () => {
    const snapshot = {
      sourceTimestamp: '2026-10-30T12:00:00Z',
      importedAt: '2026-10-31T12:00:00Z',
      bounds: { south: 46.65, west: -71.65, north: 47.05, east: -70.75 },
      ways: [],
    };
    let savedSnapshot;
    const dataSource: OsmDataSource = {
      fetchNetworkWays: async (bounds) => {
        expect(bounds).toEqual(snapshot.bounds);
        return snapshot;
      },
    };
    const repository: OsmNetworkRepository = {
      save: async (network) => {
        savedSnapshot = network;
      },
      load: async () => snapshot,
    };

    await new ImportOsmNetwork(dataSource, repository).execute(snapshot.bounds);

    expect(savedSnapshot).toEqual(snapshot);
  });

  it('does not replace stored data when extraction fails', async () => {
    const failure = new Error('Overpass unavailable');
    let saveCalled = false;
    const dataSource: OsmDataSource = {
      fetchNetworkWays: async () => {
        throw failure;
      },
    };
    const repository: OsmNetworkRepository = {
      save: async () => {
        saveCalled = true;
      },
      load: async () => null,
    };

    await expect(
      new ImportOsmNetwork(dataSource, repository).execute({
        south: 46.65,
        west: -71.65,
        north: 47.05,
        east: -70.75,
      })
    ).rejects.toBe(failure);
    expect(saveCalled).toBe(false);
  });
});
