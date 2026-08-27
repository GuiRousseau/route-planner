import { Router, type Request, type Response } from 'express';
import type { HealthCheck } from '../../application/ports/inbound/health-check.ts';

export function createHealthCheckRouter(
  healthCheck: HealthCheck,
): Router {
  const router = Router();

  router.get('/healthcheck', (_request: Request, response: Response) => {
    response.status(200).json(healthCheck.execute());
  });

  return router;
}
