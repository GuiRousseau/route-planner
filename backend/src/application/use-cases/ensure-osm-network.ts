import type { OsmDataSource } from '../ports/outbound/osm-data-source.ts';
import type { OsmNetworkRepository } from '../ports/outbound/osm-network-repository.ts';
import type {
  OsmBounds,
  OsmNetworkSnapshot,
} from '../../domain/osm/osm-network.ts';

export interface EnsuredOsmNetwork {
  snapshot: OsmNetworkSnapshot;
  imported: boolean;
}

export class EnsureOsmNetwork {
  constructor(
    private readonly dataSource: OsmDataSource,
    private readonly repository: OsmNetworkRepository
  ) {}

  async execute(bounds: OsmBounds): Promise<EnsuredOsmNetwork> {
    const storedSnapshot = await this.repository.load();
    if (storedSnapshot) {
      return { snapshot: storedSnapshot, imported: false };
    }

    const snapshot = await this.dataSource.fetchNetworkWays(bounds);
    await this.repository.save(snapshot);
    return { snapshot, imported: true };
  }
}
