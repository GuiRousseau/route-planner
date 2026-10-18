import { useState } from 'react';

interface Location {
  lat: number;
  lon: number;
  display_name: string;
}

export default function App() {
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
    <main style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Route Planner</h1>
      <form onSubmit={handleSearch} style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter address or location..."
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            boxSizing: 'border-box',
            marginBottom: '0.5rem',
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Searching...' : 'Search Location'}
        </button>
      </form>

      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

      {location && (
        <div style={{ padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
          <h2>Location Found</h2>
          <p><strong>Address:</strong> {location.display_name}</p>
          <p><strong>Latitude:</strong> {location.lat.toFixed(6)}</p>
          <p><strong>Longitude:</strong> {location.lon.toFixed(6)}</p>
        </div>
      )}
    </main>
  );
}
