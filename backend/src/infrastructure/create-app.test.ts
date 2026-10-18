import { describe, expect, it } from 'bun:test';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createApp } from './create-app.ts';

describe('createApp', () => {
  it('mounts the route endpoint', async () => {
    const server = await startServer();

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
});

async function startServer(): Promise<{ instance: Server; url: string }> {
  const instance = createApp().listen(0);
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
