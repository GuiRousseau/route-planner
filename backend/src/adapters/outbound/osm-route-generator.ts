import {
  RouteNetworkNotAvailableError,
  RouteNotFoundError,
  type GeneratedRoute,
  type RouteCoordinate,
  type RouteGenerator,
} from '../../application/ports/inbound/route-generator.ts';
import {
  buildRouteGraph,
  findNearestNode,
  haversineMeters,
  pathLength,
  pathTo,
  shortestPaths,
  type RouteGraph,
} from './osm-route-graph.ts';
import type { OsmNetworkRepository } from '../../application/ports/outbound/osm-network-repository.ts';
import type { OsmNetworkSnapshot } from '../../domain/osm/osm-network.ts';

export const DEFAULT_TARGET_DISTANCE_METERS = 5000;
const DISTANCE_TOLERANCE = 0.1;
const MAX_START_SNAP_METERS = 500;
const REUSE_PENALTY = 5;

export class OsmRouteGenerator implements RouteGenerator {
  private constructor(
    private readonly random: () => number,
    private readonly graph: RouteGraph
  ) {}

  static async create(
    repository: OsmNetworkRepository,
    random: () => number = Math.random
  ): Promise<OsmRouteGenerator> {
    const snapshot = await repository.load();
    if (!snapshot) throw new RouteNetworkNotAvailableError('OSM network has not been imported yet');
    return new OsmRouteGenerator(random, buildUsableGraph(snapshot));
  }

  async execute(
    startPoint: RouteCoordinate,
    targetDistanceMeters = DEFAULT_TARGET_DISTANCE_METERS
  ): Promise<GeneratedRoute> {
    const graph = this.graph;
    const start = findNearestNode(graph, startPoint);
    if (start === null) throw new RouteNotFoundError('No runnable way found near the start point');

    const startCoordinate = graph.nodes.get(start)!;
    if (haversineMeters(startPoint, startCoordinate) > MAX_START_SNAP_METERS) {
      throw new RouteNotFoundError('No runnable way found near the start point');
    }

    const half = targetDistanceMeters / 2;
    const outbound = shortestPaths(graph, start, undefined, half * (1 + DISTANCE_TOLERANCE * 2));

    const candidates = [...outbound.distances].filter(([id]) => id !== start);
    if (candidates.length === 0) throw new RouteNotFoundError('Start point is not connected to any runnable way');

    const band = candidates.filter(
      ([, distance]) => Math.abs(distance - half) <= half * DISTANCE_TOLERANCE
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
    let backPath = pathTo(back, start);
    let fullPath = [...outPath, ...backPath.slice(1)];
    let distance = pathLength(graph, fullPath);

    const minDistance = targetDistanceMeters * (1 - DISTANCE_TOLERANCE);
    const maxDistance = targetDistanceMeters * (1 + DISTANCE_TOLERANCE);
    if (distance < minDistance || distance > maxDistance) {
      backPath = [...outPath].reverse();
      fullPath = [...outPath, ...backPath.slice(1)];
      distance = pathLength(graph, fullPath);
      if (distance < minDistance || distance > maxDistance) {
        throw new RouteNotFoundError('Could not generate a route within the target distance');
      }
    }

    return {
      distanceMeters: Math.round(distance),
      targetDistanceMeters,
      waypoints: fullPath.map((id) => graph.nodes.get(id)!),
    };
  }
}

function buildUsableGraph(snapshot: OsmNetworkSnapshot): RouteGraph {
  const graph = buildRouteGraph(snapshot);
  for (const edges of graph.edges.values()) {
    if (edges.some((edge) => edge.length > 0)) return graph;
  }
  throw new RouteNetworkNotAvailableError('OSM network has no runnable edges');
}
