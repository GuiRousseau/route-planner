import { describe, expect, it, mock } from 'bun:test';
import { OverpassApiDataSource } from './overpass-api-data-source.ts';

describe('OverpassApiDataSource', () => {
  it('keeps paths, sidewalk roads, and ways with unknown pedestrian access', async () => {
    const fetchMock = mock(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      new Response(
        JSON.stringify({
          osm3s: { timestamp_osm_base: '2026-10-30T12:00:00Z' },
          elements: [
            {
              type: 'way',
              id: 123,
              nodes: [1, 2],
              geometry: [
                { lat: 46.8, lon: -71.2 },
                { lat: 46.81, lon: -71.21 },
              ],
              tags: {
                highway: 'residential',
                foot: 'no',
                sidewalk: 'both',
              },
            },
            {
              type: 'way',
              id: 124,
              nodes: [3, 4],
              geometry: [
                { lat: 46.82, lon: -71.22 },
                { lat: 46.83, lon: -71.23 },
              ],
              tags: { highway: 'path', surface: 'dirt' },
            },
            {
              type: 'way',
              id: 125,
              nodes: [5, 6],
              geometry: [
                { lat: 46.84, lon: -71.24 },
                { lat: 46.85, lon: -71.25 },
              ],
              tags: { highway: 'residential', sidewalk: 'left' },
            },
            {
              type: 'way',
              id: 126,
              nodes: [7, 8],
              geometry: [
                { lat: 46.86, lon: -71.26 },
                { lat: 46.87, lon: -71.27 },
              ],
              tags: { highway: 'unclassified' },
            },
          ],
        }),
        { status: 200 }
      )
    );
    const source = new OverpassApiDataSource(
      'https://overpass.example/api/interpreter',
      () => new Date('2026-10-31T12:00:00Z'),
      fetchMock
    );

    const result = await source.fetchNetworkWays({
      south: 46.65,
      west: -71.65,
      north: 47.05,
      east: -70.75,
    });

    expect(result).toEqual({
      sourceTimestamp: '2026-10-30T12:00:00Z',
      importedAt: '2026-10-31T12:00:00.000Z',
      bounds: { south: 46.65, west: -71.65, north: 47.05, east: -70.75 },
      ways: [
        {
          id: 123,
          nodes: [1, 2],
          geometry: [
            { lat: 46.8, lon: -71.2 },
            { lat: 46.81, lon: -71.21 },
          ],
          tags: {
            highway: 'residential',
            foot: 'no',
            sidewalk: 'both',
          },
        },
        {
          id: 124,
          nodes: [3, 4],
          geometry: [
            { lat: 46.82, lon: -71.22 },
            { lat: 46.83, lon: -71.23 },
          ],
          tags: { highway: 'path', surface: 'dirt' },
        },
        {
          id: 125,
          nodes: [5, 6],
          geometry: [
            { lat: 46.84, lon: -71.24 },
            { lat: 46.85, lon: -71.25 },
          ],
          tags: { highway: 'residential', sidewalk: 'left' },
        },
        {
          id: 126,
          nodes: [7, 8],
          geometry: [
            { lat: 46.86, lon: -71.26 },
            { lat: 46.87, lon: -71.27 },
          ],
          tags: { highway: 'unclassified' },
        },
      ],
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const request = fetchMock.mock.calls[0];
    expect(request?.[1]?.method).toBe('POST');
    expect(new URLSearchParams(String(request?.[1]?.body)).get('data')).toContain(
      'out body geom'
    );
    const query = new URLSearchParams(String(request?.[1]?.body)).get('data');
    expect(query).toContain(
      'way["highway"]["highway"!~"^(motorway|motorway_link|construction|proposed|raceway)$"]',
    );
    expect(query).not.toContain('foot=');
    expect(query).not.toContain('sidewalk=');
  });

  it('throws when Overpass responds with an error status', async () => {
    const source = new OverpassApiDataSource(
      'https://overpass.example/api/interpreter',
      () => new Date(),
      async () => new Response('busy', { status: 429 })
    );

    await expect(
      source.fetchNetworkWays({
        south: 46.65,
        west: -71.65,
        north: 47.05,
        east: -70.75,
      })
    ).rejects.toThrow('Overpass request failed: 429');
  });
});
