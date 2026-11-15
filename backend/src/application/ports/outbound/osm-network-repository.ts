import type { OsmNetworkSnapshot } from '../../../domain/osm/osm-network.ts';

export interface OsmNetworkRepository {
  save(snapshot: OsmNetworkSnapshot): Promise<void>;
  load(): Promise<OsmNetworkSnapshot | null>;
}
