import {
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  CircularProgress,
} from '@mui/material';
import MapIcon from '@mui/icons-material/Map';

interface LocationResultCardProps {
  lat: number;
  lon: number;
  displayName: string;
  onGenerateRoute: () => void;
  loading?: boolean;
}

export function LocationResultCard({
  lat,
  lon,
  displayName,
  onGenerateRoute,
  loading = false,
}: LocationResultCardProps) {
  return (
    <Card sx={{ mt: 4 }} data-testid="location-result">
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Location Found
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2" color="textSecondary">
            <strong>Address:</strong> {displayName}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            <strong>Latitude:</strong> {lat.toFixed(6)}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            <strong>Longitude:</strong> {lon.toFixed(6)}
          </Typography>
        </Stack>
        <Button
          fullWidth
          variant="contained"
          color="success"
          size="large"
          disabled={loading}
          data-testid="generate-route-button"
          startIcon={loading ? <CircularProgress size={20} /> : <MapIcon />}
          sx={{ mt: 2 }}
          onClick={onGenerateRoute}
        >
          {loading ? 'Generating Route...' : 'Generate Running Route'}
        </Button>
      </CardContent>
    </Card>
  );
}
