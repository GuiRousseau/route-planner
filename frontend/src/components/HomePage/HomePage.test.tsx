import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders the home page with input and search button', () => {
    render(<HomePage />);

    expect(screen.getByTestId('address-input')).toBeInTheDocument();
    expect(screen.getByTestId('search-button')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'OpenStreetMap contributors' })
    ).toHaveAttribute('href', 'https://www.openstreetmap.org/copyright');
    expect(
      screen.getByRole('link', { name: 'Open Database License (ODbL)' })
    ).toHaveAttribute('href', 'https://opendatacommons.org/licenses/odbl/');
  });

  it('updates input value when user types', async () => {
    const user = userEvent.setup();
    render(<HomePage />);
    const input = screen.getByTestId('address-input').querySelector('input') as HTMLInputElement;
    await user.type(input, 'New York');
    expect(input.value).toBe('New York');
  });

  it('displays location result when API returns data', async () => {
    const mockResponse = [
      {
        lat: '40.7128',
        lon: '-74.0060',
        display_name: 'New York, United States',
      },
    ];
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    const user = userEvent.setup();
    render(<HomePage />);
    const input = screen.getByTestId('address-input').querySelector('input') as HTMLInputElement;
    const button = screen.getByTestId('search-button');

    await user.type(input, 'New York');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('location-result')).toBeInTheDocument();
      expect(screen.getByText('New York, United States')).toBeInTheDocument();
    });
  });

  it('displays generate route button when location found', async () => {
    const mockResponse = [
      {
        lat: '40.7128',
        lon: '-74.0060',
        display_name: 'New York, United States',
      },
    ];
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    const user = userEvent.setup();
    render(<HomePage />);
    const input = screen.getByTestId('address-input').querySelector('input') as HTMLInputElement;
    const searchButton = screen.getByTestId('search-button');

    await user.type(input, 'New York');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('generate-route-button')).toBeInTheDocument();
    });
  });

  it('calls /api/route with location data when generate route clicked', async () => {
    const mockLocationResponse = [
      {
        lat: '40.7128',
        lon: '-74.0060',
        display_name: 'New York, United States',
      },
    ];
    const mockRouteResponse = { route: 'route-data' };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => mockLocationResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        statusText: 'OK',
        json: async () => mockRouteResponse,
      });

    const user = userEvent.setup();
    render(<HomePage />);
    const input = screen.getByTestId('address-input').querySelector('input') as HTMLInputElement;
    const searchButton = screen.getByTestId('search-button');

    await user.type(input, 'New York');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('generate-route-button')).toBeInTheDocument();
    });

    const generateButton = screen.getByTestId('generate-route-button');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenLastCalledWith(
        '/api/route',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startPoint: {
              lat: 40.7128,
              lon: -74.006,
            },
          }),
        })
      );
    });
  });

  it('displays error when route generation fails', async () => {
    const mockLocationResponse = [
      {
        lat: '40.7128',
        lon: '-74.0060',
        display_name: 'New York, United States',
      },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => mockLocationResponse,
      })
      .mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

    const user = userEvent.setup();
    render(<HomePage />);
    const input = screen.getByTestId('address-input').querySelector('input') as HTMLInputElement;
    const searchButton = screen.getByTestId('search-button');

    await user.type(input, 'New York');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('generate-route-button')).toBeInTheDocument();
    });

    const generateButton = screen.getByTestId('generate-route-button');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByTestId('route-error-message')).toHaveTextContent('API error: Internal Server Error');
    });
  });

  it('displays error when location is not found', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => [],
    });

    const user = userEvent.setup();
    render(<HomePage />);
    const input = screen.getByTestId('address-input').querySelector('input') as HTMLInputElement;
    const button = screen.getByTestId('search-button');

    await user.type(input, 'XyzNotAPlace123');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Location not found');
    });
  });

  it('displays error when API call fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const user = userEvent.setup();
    render(<HomePage />);
    const input = screen.getByTestId('address-input').querySelector('input') as HTMLInputElement;
    const button = screen.getByTestId('search-button');

    await user.type(input, 'New York');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to fetch location');
    });
  });

  it('shows loading state while fetching', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({ json: async () => [] }), 100))
    );

    const user = userEvent.setup();
    render(<HomePage />);
    const input = screen.getByTestId('address-input').querySelector('input') as HTMLInputElement;
    const button = screen.getByTestId('search-button');

    await user.type(input, 'New York');
    fireEvent.click(button);

    expect(button).toHaveTextContent('Searching...');
    expect(button).toBeDisabled();

    await waitFor(() => {
      expect(button).toHaveTextContent('Search Location');
      expect(button).not.toBeDisabled();
    });
  });

  it('does not submit when input is empty', async () => {
    render(<HomePage />);
    const button = screen.getByTestId('search-button');

    fireEvent.click(button);

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('clears previous location when new search fails', async () => {
    const mockSuccessResponse = [
      {
        lat: '40.7128',
        lon: '-74.0060',
        display_name: 'New York, United States',
      },
    ];
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockSuccessResponse,
    });

    const user = userEvent.setup();
    render(<HomePage />);
    const input = screen.getByTestId('address-input').querySelector('input') as HTMLInputElement;
    const button = screen.getByTestId('search-button');

    await user.type(input, 'New York');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('location-result')).toBeInTheDocument();
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => [],
    });

    await user.clear(input);
    await user.type(input, 'XyzNotAPlace123');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.queryByTestId('location-result')).not.toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toHaveTextContent('Location not found');
    });
  });
});
