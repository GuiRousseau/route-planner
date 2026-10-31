import type {
  OsmBounds,
  OsmNetworkSnapshot,
} from '../../../domain/osm/osm-network.ts';

export interface OsmDataSource {
  fetchNetworkWays(bounds: OsmBounds): Promise<OsmNetworkSnapshot>;
}
