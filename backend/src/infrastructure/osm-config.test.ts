import { describe, expect, it } from 'bun:test';
import { loadOsmConfig } from './osm-config.ts';

describe('loadOsmConfig', () => {
  it('uses the Quebec City area and local-file defaults', () => {
    const config = loadOsmConfig({});

    expect(config.overpassEndpoint).toBe(
      'https://overpass-api.de/api/interpreter'
    );
    expect(config.bounds).toEqual({
      south: 46.65,
      west: -71.65,
      north: 47.05,
      east: -70.75,
    });
    expect(config.mapDataFile.endsWith('/data/quebec-city-osm.json')).toBe(true);
  });

  it('allows the extraction bounds, endpoint, and storage file to be changed', () => {
    const config = loadOsmConfig({
      OSM_BBOX: '46.7,-71.5,47,-70.8',
      OSM_OVERPASS_ENDPOINT: 'https://example.com/interpreter',
      MAP_DATA_FILE: '/tmp/custom-osm.json',
    });

    expect(config).toEqual({
      overpassEndpoint: 'https://example.com/interpreter',
      bounds: { south: 46.7, west: -71.5, north: 47, east: -70.8 },
      mapDataFile: '/tmp/custom-osm.json',
    });
  });

  it('rejects invalid bounds configuration', () => {
    expect(() => loadOsmConfig({ OSM_BBOX: '47,-71,46,-70' })).toThrow(
      'OSM_BBOX must describe valid south,west,north,east bounds'
    );
  });
});
