export interface RouteStartPoint {
  lat: number;
  lon: number;
}

export interface RouteRequest {
  startPoint: RouteStartPoint;
}

export interface RouteResponse {
  distanceMeters: number;
  targetDistanceMeters: number;
  waypoints: Array<{
    lat: number;
    lon: number;
  }>;
}
