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

interface Location {
  lat: number;
  lon: number;
  display_name: string;
}

export function HomePage() {
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
}

