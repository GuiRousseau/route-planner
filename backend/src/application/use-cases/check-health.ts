import type {
  HealthCheck,
  HealthCheckResult,
} from '../ports/inbound/health-check.ts';

export class CheckHealth implements HealthCheck {
  execute(): HealthCheckResult {
    return { status: 'ok' };
  }
}
