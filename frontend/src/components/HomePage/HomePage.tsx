import { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MapIcon from '@mui/icons-material/Map';
import type { RouteRequest } from '../../../lib/route-dto';

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
      // Route generation successful, could navigate or display result here
    } catch (err) {
      setRouteError(err instanceof Error ? err.message : 'Failed to generate route');
    } finally {
      setGeneratingRoute(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
          Route Planner
        </Typography>

        <form onSubmit={handleSearch}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
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
          <Card sx={{ mt: 4 }} data-testid="location-result">
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Location Found
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" color="textSecondary">
                  <strong>Address:</strong> {location.display_name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Latitude:</strong> {location.lat.toFixed(6)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Longitude:</strong> {location.lon.toFixed(6)}
                </Typography>
              </Stack>
              <Button
                fullWidth
                variant="contained"
                color="success"
                size="large"
                disabled={generatingRoute}
                data-testid="generate-route-button"
                startIcon={generatingRoute ? <CircularProgress size={20} /> : <MapIcon />}
                sx={{ mt: 2 }}
                onClick={handleGenerateRoute}
              >
                {generatingRoute ? 'Generating Route...' : 'Generate Running Route'}
              </Button>
            </CardContent>
          </Card>
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


