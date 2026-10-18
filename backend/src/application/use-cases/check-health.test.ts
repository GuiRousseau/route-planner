import { describe, expect, it } from 'bun:test';
import { CheckHealth } from './check-health.ts';

describe('CheckHealth', () => {
  it('reports that the service is healthy', () => {
    const healthCheck = new CheckHealth();

    expect(healthCheck.execute()).toEqual({ status: 'ok' });
  });
});
