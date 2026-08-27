import express from 'express';
import { createHealthCheckRouter } from '../adapters/http/health-check-route.ts';
import { CheckHealth } from '../application/use-cases/check-health.ts';

export function createApp() {
  const app = express();
  const healthCheck = new CheckHealth();

  app.use(createHealthCheckRouter(healthCheck));

  return app;
}
