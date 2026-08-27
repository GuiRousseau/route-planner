import { describe, expect, it } from 'bun:test';
import express from 'express';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createHealthCheckRouter } from './health-check-route.ts';

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

  it('does not expose the previous route endpoint', async () => {
    const app = express();
    app.use(createHealthCheckRouter({ execute: () => ({ status: 'ok' }) }));
    const server = await startServer(app);

    try {
      const response = await fetch(`${server.url}/route`, { method: 'POST' });

      expect(response.status).toBe(404);
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
