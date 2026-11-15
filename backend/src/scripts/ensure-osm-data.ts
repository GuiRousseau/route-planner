import { FileOsmNetworkRepository } from '../adapters/outbound/file-osm-network-repository.ts';
import { OverpassApiDataSource } from '../adapters/outbound/overpass-api-data-source.ts';
import { EnsureOsmNetwork } from '../application/use-cases/ensure-osm-network.ts';
import { loadOsmConfig } from '../infrastructure/osm-config.ts';

async function main(): Promise<void> {
  const config = loadOsmConfig();
  const repository = new FileOsmNetworkRepository(config.mapDataFile);
  const result = await new EnsureOsmNetwork(
    new OverpassApiDataSource(config.overpassEndpoint),
    repository
  ).execute(config.bounds);

  console.log(
    result.imported
      ? `Imported ${result.snapshot.ways.length} OSM highway ways to ${config.mapDataFile}`
      : `Using existing OSM network at ${config.mapDataFile}`
  );
}

main().catch((error: unknown) => {
  console.error('OSM data initialization failed:', error);
  process.exitCode = 1;
});
