import { describe, expect, it } from 'bun:test';
import express from 'express';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createHealthCheckRouter } from './health-check-route.ts';
import { createRouteRouter } from './route.ts';

describe('healthcheck route', () => {
  it('returns a healthy response', async () => {
    const app = express();
    app.use(createHealthCheckRouter({ execute: () => ({ status: 'ok' }) }));
    const server = await startServer(app);

    try {
      const response = await fetch(`${server.url}/healthcheck`);

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ status: 'ok' });
    } finally {
      await stopServer(server.instance);
    }
  });

  it('returns the route endpoint response', async () => {
    const app = express();
    app.use(express.json());
    app.use(createRouteRouter());
    const server = await startServer(app);

    try {
      const response = await fetch(`${server.url}/route`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        message: 'Route endpoint received',
      });
    } finally {
      await stopServer(server.instance);
    }
  });

  it('rejects non-object route input', async () => {
    const app = express();
    app.use(express.json());
    app.use(createRouteRouter());
    const server = await startServer(app);

    try {
      const response = await fetch(`${server.url}/route`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(['invalid']),
      });

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: 'Request body must be a JSON object',
      });
    } finally {
      await stopServer(server.instance);
    }
  });
});

async function startServer(app: express.Express): Promise<{
  instance: Server;
  url: string;
}> {
  const instance = app.listen(0);
  await new Promise<void>((resolve) => instance.once('listening', resolve));
  const address = instance.address() as AddressInfo;

  return {
    instance,
    url: `http://127.0.0.1:${address.port}`,
  };
}

async function stopServer(instance: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    instance.close((error) => (error ? reject(error) : resolve()));
  });
}
