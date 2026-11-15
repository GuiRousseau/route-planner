export interface RouteCoordinate {
  lat: number;
  lon: number;
}

export interface GeneratedRoute {
  distanceMeters: number;
  targetDistanceMeters: number;
  waypoints: RouteCoordinate[];
}

export interface RouteGenerator {
  execute(startPoint: RouteCoordinate, targetDistanceMeters?: number): Promise<GeneratedRoute>;
}

export class RouteNetworkNotAvailableError extends Error {}
export class RouteNotFoundError extends Error {}
