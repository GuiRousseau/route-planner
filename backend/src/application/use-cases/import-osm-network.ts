import type { OsmDataSource } from '../ports/outbound/osm-data-source.ts';
import type { OsmNetworkRepository } from '../ports/outbound/osm-network-repository.ts';
import type {
  OsmBounds,
  OsmNetworkSnapshot,
} from '../../domain/osm/osm-network.ts';

export class ImportOsmNetwork {
  constructor(
    private readonly dataSource: OsmDataSource,
    private readonly repository: OsmNetworkRepository
  ) {}

  async execute(bounds: OsmBounds): Promise<OsmNetworkSnapshot> {
    const snapshot = await this.dataSource.fetchNetworkWays(bounds);
    await this.repository.save(snapshot);
    return snapshot;
  }
}
