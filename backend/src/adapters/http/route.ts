import { Router, type Request, type Response } from 'express';

export function createRouteRouter(): Router {
  const router = Router();

  router.post('/route', (request: Request, response: Response) => {
    if (
      request.body !== undefined &&
      (typeof request.body !== 'object' || request.body === null || Array.isArray(request.body))
    ) {
      response.status(400).json({
        error: 'Request body must be a JSON object',
      });
      return;
    }

    response.status(200).json({ message: 'Route endpoint received' });
  });

  return router;
}
