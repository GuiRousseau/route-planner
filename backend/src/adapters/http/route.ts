import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import type { RouteRequest } from '../../../../lib/route-dto.ts';
import {
  type RouteGenerator,
  RouteNetworkNotAvailableError,
  RouteNotFoundError,
} from '../../application/ports/inbound/route-generator.ts';

const routeRequestSchema: z.ZodType<RouteRequest> = z.object({
  startPoint: z.object({
    lat: z.number().min(-90).max(90),
    lon: z.number().min(-180).max(180),
  }),
});

export function createRouteRouter(generateRoute: RouteGenerator): Router {
  const router = Router();

  router.post('/route', async (request: Request, response: Response) => {
    const parsed = routeRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({
        error: 'Request body must contain a startPoint with numeric lat and lon',
      });
      return;
    }

    try {
      response.status(200).json(await generateRoute.execute(parsed.data.startPoint));
    } catch (error) {
      if (error instanceof RouteNetworkNotAvailableError) {
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
