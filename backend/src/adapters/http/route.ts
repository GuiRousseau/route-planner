import { Router, type Request, type Response } from 'express';
import {
  GenerateRoute,
  OsmNetworkNotAvailableError,
  RouteNotFoundError,
} from '../../application/use-cases/generate-route.ts';

export function createRouteRouter(generateRoute: GenerateRoute): Router {
  const router = Router();

  router.post('/route', async (request: Request, response: Response) => {
    const startPoint = parseStartPoint(request.body);
    if (!startPoint) {
      response.status(400).json({
        error: 'Request body must contain a startPoint with numeric lat and lon',
      });
      return;
    }

    try {
      response.status(200).json(await generateRoute.execute(startPoint));
    } catch (error) {
      if (error instanceof OsmNetworkNotAvailableError) {
        response.status(404).json({ error: error.message });
      } else if (error instanceof RouteNotFoundError) {
        response.status(422).json({ error: error.message });
      } else {
        response.status(500).json({ error: 'Failed to generate route' });
      }
    }
  });

  return router;
}

function parseStartPoint(body: unknown): { lat: number; lon: number } | null {
  if (typeof body !== 'object' || body === null) return null;
  const startPoint = (body as Record<string, unknown>).startPoint;
  if (typeof startPoint !== 'object' || startPoint === null) return null;

  const { lat, lon } = startPoint as Record<string, unknown>;
  if (typeof lat !== 'number' || typeof lon !== 'number') return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  return { lat, lon };
}
