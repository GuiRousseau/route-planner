import { afterEach, describe, expect, it } from 'bun:test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { FileOsmNetworkRepository } from './file-osm-network-repository.ts';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true })
    )
  );
});

describe('FileOsmNetworkRepository', () => {
  it('writes and reads a network snapshot from the configured file', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'route-planner-osm-'));
    temporaryDirectories.push(directory);
    const filePath = join(directory, 'map', 'network.json');
    const repository = new FileOsmNetworkRepository(filePath);
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

    await repository.save(snapshot);

    expect(await repository.load()).toEqual(snapshot);
    expect(JSON.parse(await readFile(filePath, 'utf8'))).toEqual(snapshot);
  });

  it('returns null when the configured file does not exist', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'route-planner-osm-'));
    temporaryDirectories.push(directory);

    await expect(
      new FileOsmNetworkRepository(join(directory, 'missing.json')).load()
    ).resolves.toBeNull();
  });
});
