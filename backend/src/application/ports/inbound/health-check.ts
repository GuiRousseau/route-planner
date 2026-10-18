export interface HealthCheckResult {
  status: 'ok';
}

export interface HealthCheck {
  execute(): HealthCheckResult;
}
