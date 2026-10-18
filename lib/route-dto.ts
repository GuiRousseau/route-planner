export interface RouteStartPoint {
  lat: number;
  lon: number;
}

export interface RouteRequest {
  startPoint: RouteStartPoint;
}

export interface RouteResponse {
  route: string;
  waypoints?: Array<{
    lat: number;
    lon: number;
  }>;
}
