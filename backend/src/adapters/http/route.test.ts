import { describe, expect, it } from 'bun:test';
import express from 'express';
import type { AddressInfo } from 'node:net';
import type { RouteCoordinate, RouteGenerator } from '../../application/ports/inbound/route-generator.ts';
import { createRouteRouter } from './route.ts';

describe('route endpoint', () => {
  it('accepts a route generator independent of the map data implementation', async () => {
    const startPoint = { lat: 46.8, lon: -71.2 };
    const route = { distanceMeters: 5000, targetDistanceMeters: 5000, waypoints: [startPoint] };
    let receivedStart: RouteCoordinate | undefined;
    const generator: RouteGenerator = {
      execute: async (start) => {
        receivedStart = start;
        return route;
      },
    };
    const app = express();
    app.use(express.json(), createRouteRouter(generator));
    const server = app.listen(0);

    try {
      await new Promise<void>((resolve) => server.once('listening', resolve));
      const { port } = server.address() as AddressInfo;
      const response = await fetch(`http://127.0.0.1:${port}/route`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ startPoint }),
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(route);
      expect(receivedStart).toEqual(startPoint);
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });
});
