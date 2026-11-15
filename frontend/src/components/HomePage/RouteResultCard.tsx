import { useEffect, useRef } from 'react';
import { Button, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { map, polyline, tileLayer, type LatLngTuple } from 'leaflet';
import type { RouteResponse } from '../../../../lib/route-dto';

interface RouteResultCardProps {
  route: RouteResponse;
  onRegenerateRoute: () => void;
  loading: boolean;
}

export function RouteResultCard({ route, onRegenerateRoute, loading }: RouteResultCardProps) {
  const mapElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapElement.current) return;

    const routeMap = map(mapElement.current);
    tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    }).addTo(routeMap);
    const coordinates: LatLngTuple[] = route.waypoints.map(({ lat, lon }) => [lat, lon]);
    const routeLine = polyline(coordinates, { color: '#1976d2', weight: 5 }).addTo(routeMap);
    routeMap.fitBounds(routeLine.getBounds(), { padding: [20, 20], maxZoom: 17 });

    return () => {
      routeMap.remove();
    };
  }, [route]);

  return (
    <Card sx={{ mt: 4 }} data-testid="route-result">
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Planned Route
        </Typography>
        <Typography gutterBottom>
          Distance: {(route.distanceMeters / 1000).toFixed(2)} km
        </Typography>
        <div ref={mapElement} className="route-map" role="region" aria-label="Planned route map" />
        <Button
          fullWidth
          variant="contained"
          color="success"
          size="large"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
          sx={{ mt: 2 }}
          onClick={onRegenerateRoute}
        >
          {loading ? 'Generating Route...' : 'Regenerate Route'}
        </Button>
      </CardContent>
    </Card>
  );
}
