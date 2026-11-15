import type { OsmNetworkSnapshot } from '../../domain/osm/osm-network.ts';
import type { OsmNetworkRepository } from '../ports/outbound/osm-network-repository.ts';

export class GetOsmNetwork {
  constructor(private readonly repository: OsmNetworkRepository) {}

  execute(): Promise<OsmNetworkSnapshot | null> {
    return this.repository.load();
  }
}
