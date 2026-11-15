import { render } from '@testing-library/react';
import { map, polyline, tileLayer } from 'leaflet';
import { RouteResultCard } from './RouteResultCard';

jest.mock('leaflet', () => {
  const routeMap = { fitBounds: jest.fn(), remove: jest.fn() };
  const line = { addTo: jest.fn().mockReturnThis(), getBounds: jest.fn(() => 'bounds') };
  return {
    map: jest.fn(() => routeMap),
    tileLayer: jest.fn(() => ({ addTo: jest.fn() })),
    polyline: jest.fn(() => line),
  };
});

it('draws the route in waypoint order, fits it on the map, and cleans up', () => {
  const route = {
    distanceMeters: 5000,
    targetDistanceMeters: 5000,
    waypoints: [{ lat: 46.8, lon: -71.2 }, { lat: 46.81, lon: -71.21 }, { lat: 46.8, lon: -71.2 }],
  };
  const { unmount } = render(
    <RouteResultCard route={route} onRegenerateRoute={jest.fn()} loading={false} />
  );
  const routeMap = jest.mocked(map).mock.results[0].value;

  expect(tileLayer).toHaveBeenCalledWith(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    expect.objectContaining({ attribution: expect.stringContaining('OpenStreetMap') })
  );
  expect(polyline).toHaveBeenCalledWith(
    [[46.8, -71.2], [46.81, -71.21], [46.8, -71.2]],
    expect.any(Object)
  );
  expect(routeMap.fitBounds).toHaveBeenCalledWith('bounds', expect.any(Object));
  unmount();
  expect(routeMap.remove).toHaveBeenCalled();
});
