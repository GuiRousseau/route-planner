import { FileOsmNetworkRepository } from '../adapters/outbound/file-osm-network-repository.ts';
import { OverpassApiDataSource } from '../adapters/outbound/overpass-api-data-source.ts';
import { ImportOsmNetwork } from '../application/use-cases/import-osm-network.ts';
import { loadOsmConfig } from '../infrastructure/osm-config.ts';

async function main(): Promise<void> {
  const config = loadOsmConfig();
  const repository = new FileOsmNetworkRepository(config.mapDataFile);
  const snapshot = await new ImportOsmNetwork(
    new OverpassApiDataSource(config.overpassEndpoint),
    repository
  ).execute(config.bounds);

  console.log(
    `Imported ${snapshot.ways.length} OSM highway ways from ${snapshot.sourceTimestamp} to ${config.mapDataFile}`
  );
}

main().catch((error: unknown) => {
  console.error('OSM data import failed:', error);
  process.exitCode = 1;
});
