import { Router, type Request, type Response } from 'express';

export function createRouteRouter(): Router {
  const router = Router();

  router.post('/route', (request: Request, response: Response) => {
    if (!isValidRouteRequestBody(request.body)) {
      response.status(400).json({
        error: 'Request body must be a JSON object',
      });
      return;
    }

    response.status(200).json({ message: 'Route endpoint received' });
  });

  return router;
}

function isValidRouteRequestBody(body: unknown): boolean {
  return (
    body === undefined ||
    (typeof body === 'object' && body !== null && !Array.isArray(body))
  );
}
