import type { OsmCoordinate, OsmNetworkSnapshot } from '../osm/osm-network.ts';

export interface GraphEdge {
  from: number;
  to: number;
  length: number;
}

export interface RouteGraph {
  nodes: Map<number, OsmCoordinate>;
  edges: Map<number, GraphEdge[]>;
}

export interface ShortestPaths {
  distances: Map<number, number>;
  previous: Map<number, number>;
}

const EXCLUDED_HIGHWAYS = new Set([
  'motorway',
  'motorway_link',
  'trunk',
  'trunk_link',
  'construction',
  'proposed',
  'raceway',
  'bus_guideway',
  'busway',
]);
const BLOCKED_ACCESS = new Set(['no', 'private']);

const EARTH_RADIUS_METERS = 6_371_000;

export function haversineMeters(a: OsmCoordinate, b: OsmCoordinate): number {
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

export function isRunnableWay(tags: Record<string, string>): boolean {
  const highway = tags.highway;
  if (!highway || EXCLUDED_HIGHWAYS.has(highway)) return false;
  if (BLOCKED_ACCESS.has(tags.foot) || (tags.foot === undefined && BLOCKED_ACCESS.has(tags.access))) {
    return false;
  }
  return true;
}

export function buildRouteGraph(snapshot: OsmNetworkSnapshot): RouteGraph {
  const nodes = new Map<number, OsmCoordinate>();
  const edges = new Map<number, GraphEdge[]>();

  const addEdge = (edge: GraphEdge) => {
    const list = edges.get(edge.from);
    if (list) list.push(edge);
    else edges.set(edge.from, [edge]);
  };

  for (const way of snapshot.ways) {
    if (!isRunnableWay(way.tags)) continue;
    if (way.nodes.length !== way.geometry.length) continue;

    for (let i = 0; i < way.nodes.length; i++) {
      nodes.set(way.nodes[i], way.geometry[i]);
      if (i === 0) continue;

      const from = way.nodes[i - 1];
      const to = way.nodes[i];
      if (from === to) continue;
      const length = haversineMeters(way.geometry[i - 1], way.geometry[i]);
      addEdge({ from, to, length });
      addEdge({ from: to, to: from, length });
    }
  }

  return { nodes, edges };
}

export function findNearestNode(
  graph: RouteGraph,
  point: OsmCoordinate
): number | null {
  let best: number | null = null;
  let bestDistance = Infinity;
  for (const [id, coordinate] of graph.nodes) {
    if (!graph.edges.has(id)) continue;
    const distance = haversineMeters(point, coordinate);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = id;
    }
  }
  return best;
}

export function shortestPaths(
  graph: RouteGraph,
  source: number,
  edgeCost: (edge: GraphEdge) => number = (edge) => edge.length,
  maxCost = Infinity
): ShortestPaths {
  const distances = new Map<number, number>([[source, 0]]);
  const previous = new Map<number, number>();
  const queue = new MinHeap();
  queue.push(source, 0);

  while (queue.size > 0) {
    const { id, priority } = queue.pop()!;
    if (priority > (distances.get(id) ?? Infinity)) continue;

    for (const edge of graph.edges.get(id) ?? []) {
      const candidate = priority + edgeCost(edge);
      if (candidate > maxCost) continue;
      if (candidate < (distances.get(edge.to) ?? Infinity)) {
        distances.set(edge.to, candidate);
        previous.set(edge.to, id);
        queue.push(edge.to, candidate);
      }
    }
  }

  return { distances, previous };
}

export function pathTo(paths: ShortestPaths, target: number): number[] {
  const path = [target];
  let current = target;
  while (paths.previous.has(current)) {
    current = paths.previous.get(current)!;
    path.push(current);
  }
  return path.reverse();
}

export function pathLength(graph: RouteGraph, path: number[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    total += haversineMeters(graph.nodes.get(path[i - 1])!, graph.nodes.get(path[i])!);
  }
  return total;
}

class MinHeap {
  private items: Array<{ id: number; priority: number }> = [];

  get size(): number {
    return this.items.length;
  }

  push(id: number, priority: number): void {
    const items = this.items;
    items.push({ id, priority });
    let i = items.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (items[parent].priority <= items[i].priority) break;
      [items[parent], items[i]] = [items[i], items[parent]];
      i = parent;
    }
  }

  pop(): { id: number; priority: number } | undefined {
    const items = this.items;
    const top = items[0];
    const last = items.pop();
    if (items.length > 0 && last) {
      items[0] = last;
      let i = 0;
      for (;;) {
        const left = 2 * i + 1;
        const right = left + 1;
        let smallest = i;
        if (left < items.length && items[left].priority < items[smallest].priority) smallest = left;
        if (right < items.length && items[right].priority < items[smallest].priority) smallest = right;
        if (smallest === i) break;
        [items[smallest], items[i]] = [items[i], items[smallest]];
        i = smallest;
      }
    }
    return top;
  }
}
