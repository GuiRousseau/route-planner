import { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import type { RouteRequest, RouteResponse } from '../../../../lib/route-dto';
import { LocationResultCard } from './LocationResultCard';
import { RouteResultCard } from './RouteResultCard';

interface Location {
  lat: number;
  lon: number;
  display_name: string;
}

export function HomePage() {
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<Location | null>(null);
  const [route, setRoute] = useState<RouteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingRoute, setGeneratingRoute] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || generatingRoute) return;

    setLoading(true);
    setRoute(null);
    setLocation(null);
    setError(null);
    setRouteError(null);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
      );
      const data = await response.json();
      if (data.length === 0) {
        setError('Location not found');
        setLocation(null);
      } else {
        setLocation({
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          display_name: data[0].display_name,
        });
      }
    } catch (err) {
      setError('Failed to fetch location');
      setLocation(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoute = async () => {
    if (!location || loading || generatingRoute) return;

    setGeneratingRoute(true);
    setRouteError(null);
    try {
      const request: RouteRequest = {
        startPoint: {
          lat: location.lat,
          lon: location.lon,
        },
      };

      const response = await fetch('/api/route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const result: RouteResponse = await response.json();
      if (
        !Number.isFinite(result.distanceMeters) ||
        !Array.isArray(result.waypoints) ||
        result.waypoints.length < 2 ||
        !result.waypoints.every(
          (point) =>
            point &&
            Number.isFinite(point.lat) &&
            Number.isFinite(point.lon) &&
            Math.abs(point.lat) <= 90 &&
            Math.abs(point.lon) <= 180
        )
      ) {
        throw new Error('Invalid route returned by the server');
      }
      setRoute(result);
    } catch (err) {
      setRouteError(err instanceof Error ? err.message : 'Failed to generate route');
    } finally {
      setGeneratingRoute(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <form onSubmit={handleSearch}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              label="Address or location"
              placeholder="Enter address or location..."
              data-testid="address-input"
              variant="outlined"
              disabled={loading || generatingRoute}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading || generatingRoute}
              data-testid="search-button"
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
            >
              {loading ? 'Searching...' : 'Search Location'}
            </Button>
          </Stack>
        </form>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }} data-testid="error-message">
            {error}
          </Alert>
        )}

        {route ? (
          <RouteResultCard
            route={route}
            onRegenerateRoute={handleGenerateRoute}
            loading={generatingRoute}
          />
        ) : location && (
          <LocationResultCard
            lat={location.lat}
            lon={location.lon}
            displayName={location.display_name}
            onGenerateRoute={handleGenerateRoute}
            loading={generatingRoute}
          />
        )}

        {routeError && (
          <Alert severity="error" sx={{ mt: 2 }} data-testid="route-error-message">
            {routeError}
          </Alert>
        )}
        <Box component="footer" sx={{ mt: 3, typography: 'caption' }}>
          Map data ©{' '}
          <a href="https://www.openstreetmap.org/copyright">
            OpenStreetMap contributors
          </a>
          . Data available under the{' '}
          <a href="https://opendatacommons.org/licenses/odbl/">
            Open Database License (ODbL)
          </a>
          .
        </Box>
      </Box>
    </Container>
  );
}

