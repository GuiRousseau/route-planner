import type { OsmCoordinate } from '../../domain/osm/osm-network.ts';
import {
  buildRouteGraph,
  findNearestNode,
  haversineMeters,
  pathLength,
  pathTo,
  shortestPaths,
} from '../../domain/route/route-graph.ts';
import type { OsmNetworkRepository } from '../ports/outbound/osm-network-repository.ts';

export const DEFAULT_TARGET_DISTANCE_METERS = 5000;
const TURNAROUND_TOLERANCE = 0.1;
const MAX_START_SNAP_METERS = 500;
const REUSE_PENALTY = 5;

export interface GeneratedRoute {
  distanceMeters: number;
  targetDistanceMeters: number;
  waypoints: OsmCoordinate[];
}

export class OsmNetworkNotAvailableError extends Error {}
export class RouteNotFoundError extends Error {}

export class GenerateRoute {
  constructor(
    private readonly repository: OsmNetworkRepository,
    private readonly random: () => number = Math.random
  ) {}

  async execute(
    startPoint: OsmCoordinate,
    targetDistanceMeters = DEFAULT_TARGET_DISTANCE_METERS
  ): Promise<GeneratedRoute> {
    const snapshot = await this.repository.load();
    if (!snapshot) throw new OsmNetworkNotAvailableError('OSM network has not been imported yet');

    const graph = buildRouteGraph(snapshot);
    const start = findNearestNode(graph, startPoint);
    if (start === null) throw new RouteNotFoundError('No runnable way found near the start point');

    const startCoordinate = graph.nodes.get(start)!;
    if (haversineMeters(startPoint, startCoordinate) > MAX_START_SNAP_METERS) {
      throw new RouteNotFoundError('No runnable way found near the start point');
    }

    const half = targetDistanceMeters / 2;
    const outbound = shortestPaths(graph, start, undefined, half * (1 + TURNAROUND_TOLERANCE * 2));

    const candidates = [...outbound.distances].filter(([id]) => id !== start);
    if (candidates.length === 0) throw new RouteNotFoundError('Start point is not connected to any runnable way');

    const band = candidates.filter(
      ([, distance]) => Math.abs(distance - half) <= half * TURNAROUND_TOLERANCE
    );
    const pool = band.length > 0 ? band : [candidates.reduce((a, b) => (b[1] > a[1] ? b : a))];
    const [turnaround] = pool[Math.floor(this.random() * pool.length)];

    const outPath = pathTo(outbound, turnaround);
    const outEdges = new Set<string>();
    for (let i = 1; i < outPath.length; i++) {
      outEdges.add(`${outPath[i - 1]}-${outPath[i]}`);
      outEdges.add(`${outPath[i]}-${outPath[i - 1]}`);
    }

    // Penalise the outbound edges so the way back differs where possible.
    const back = shortestPaths(graph, turnaround, (edge) =>
      outEdges.has(`${edge.from}-${edge.to}`) ? edge.length * REUSE_PENALTY : edge.length
    );
    if (!back.distances.has(start)) throw new RouteNotFoundError('Could not find a way back to the start point');
    const backPath = pathTo(back, start);

    const fullPath = [...outPath, ...backPath.slice(1)];
    return {
      distanceMeters: Math.round(pathLength(graph, fullPath)),
      targetDistanceMeters,
      waypoints: fullPath.map((id) => graph.nodes.get(id)!),
    };
  }
}
