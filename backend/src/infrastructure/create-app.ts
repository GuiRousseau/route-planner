import express from 'express';
import { createHealthCheckRouter } from '../adapters/http/health-check-route.ts';
import { createMapDataRouter } from '../adapters/http/map-data-route.ts';
import { createRouteRouter } from '../adapters/http/route.ts';
import { CheckHealth } from '../application/use-cases/check-health.ts';
import { GetOsmNetwork } from '../application/use-cases/get-osm-network.ts';
import type { OsmNetworkRepository } from '../application/ports/outbound/osm-network-repository.ts';
import { FileOsmNetworkRepository } from '../adapters/outbound/file-osm-network-repository.ts';
import { loadOsmConfig } from './osm-config.ts';

export function createApp(
  osmNetworkRepository: OsmNetworkRepository = new FileOsmNetworkRepository(
    loadOsmConfig().mapDataFile
  )
) {
  const app = express();
  const healthCheck = new CheckHealth();

  app.use(express.json());
  app.use(createHealthCheckRouter(healthCheck));
  app.use(createMapDataRouter(new GetOsmNetwork(osmNetworkRepository)));
  app.use(createRouteRouter());

  return app;
}
