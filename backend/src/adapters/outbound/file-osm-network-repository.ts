import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { OsmNetworkSnapshot } from '../../domain/osm/osm-network.ts';
import { isOsmNetworkSnapshot } from '../../domain/osm/osm-network.ts';
import type { OsmNetworkRepository } from '../../application/ports/outbound/osm-network-repository.ts';

export class FileOsmNetworkRepository implements OsmNetworkRepository {
  constructor(private readonly filePath: string) {}

  async save(snapshot: OsmNetworkSnapshot): Promise<void> {
    const directory = dirname(this.filePath);
    const temporaryFile = `${this.filePath}.${randomUUID()}.tmp`;
    await mkdir(directory, { recursive: true });

    try {
      await writeFile(temporaryFile, JSON.stringify(snapshot), 'utf8');
      await rename(temporaryFile, this.filePath);
    } finally {
      await unlink(temporaryFile).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== 'ENOENT') throw error;
      });
    }
  }

  async load(): Promise<OsmNetworkSnapshot | null> {
    let contents: string;
    try {
      contents = await readFile(this.filePath, 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }

    let snapshot: unknown;
    try {
      snapshot = JSON.parse(contents);
    } catch {
      throw new Error(`Stored OSM network is not valid JSON: ${this.filePath}`);
    }

    if (!isOsmNetworkSnapshot(snapshot)) {
      throw new Error(`Stored OSM network has an invalid shape: ${this.filePath}`);
    }
    return snapshot;
  }
}
