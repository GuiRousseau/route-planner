import express from 'express';
import { createHealthCheckRouter } from '../adapters/http/health-check-route.ts';
import { createRouteRouter } from '../adapters/http/route.ts';
import { CheckHealth } from '../application/use-cases/check-health.ts';

export function createApp() {
  const app = express();
  const healthCheck = new CheckHealth();

  app.use(express.json());
  app.use(createHealthCheckRouter(healthCheck));
  app.use(createRouteRouter());

  return app;
}
