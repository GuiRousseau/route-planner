import { Router } from 'express';
import { GetOsmNetwork } from '../../application/use-cases/get-osm-network.ts';

export function createMapDataRouter(getOsmNetwork: GetOsmNetwork): Router {
  const router = Router();

  router.get('/map-data', async (_request, response) => {
    try {
      const snapshot = await getOsmNetwork.execute();
      if (!snapshot) {
        response.status(404).json({
          error: 'OSM network has not been imported yet',
        });
        return;
      }

      response.status(200).json(snapshot);
    } catch {
      response.status(500).json({ error: 'Failed to load local OSM network' });
    }
  });

  return router;
}
