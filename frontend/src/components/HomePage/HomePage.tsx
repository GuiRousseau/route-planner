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
import type { RouteRequest } from '../../../../lib/route-dto';
import { LocationResultCard } from './LocationResultCard';

interface Location {
  lat: number;
  lon: number;
  display_name: string;
}

export function HomePage() {
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingRoute, setGeneratingRoute] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    setLoading(true);
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
    if (!location) return;

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

      const result = await response.json();
      console.log('Route generated:', result);
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
              disabled={loading}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
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

        {location && (
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
      </Box>
    </Container>
  );
}


