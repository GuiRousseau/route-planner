import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders the home page with title and input', () => {
    render(<HomePage />);
    expect(screen.getByText('Route Planner')).toBeInTheDocument();
    expect(screen.getByTestId('address-input')).toBeInTheDocument();
    expect(screen.getByTestId('search-button')).toBeInTheDocument();
  });

  it('updates input value when user types', () => {
    render(<HomePage />);
    const input = screen.getByTestId('address-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'New York' } });
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

    render(<HomePage />);
    const input = screen.getByTestId('address-input') as HTMLInputElement;
    const button = screen.getByTestId('search-button');

    fireEvent.change(input, { target: { value: 'New York' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('location-result')).toBeInTheDocument();
      expect(screen.getByText('New York, United States')).toBeInTheDocument();
      expect(screen.getByText(/40.712800/)).toBeInTheDocument();
      expect(screen.getByText(/-74.006000/)).toBeInTheDocument();
    });
  });

  it('displays error when location is not found', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => [],
    });

    render(<HomePage />);
    const input = screen.getByTestId('address-input') as HTMLInputElement;
    const button = screen.getByTestId('search-button');

    fireEvent.change(input, { target: { value: 'XyzNotAPlace123' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Location not found');
    });
  });

  it('displays error when API call fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<HomePage />);
    const input = screen.getByTestId('address-input') as HTMLInputElement;
    const button = screen.getByTestId('search-button');

    fireEvent.change(input, { target: { value: 'New York' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to fetch location');
    });
  });

  it('shows loading state while fetching', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({ json: async () => [] }), 100))
    );

    render(<HomePage />);
    const input = screen.getByTestId('address-input') as HTMLInputElement;
    const button = screen.getByTestId('search-button');

    fireEvent.change(input, { target: { value: 'New York' } });
    fireEvent.click(button);

    expect(button).toHaveTextContent('Searching...');
    expect(button).toBeDisabled();

    await waitFor(() => {
      expect(button).toHaveTextContent('Search Location');
      expect(button).not.toBeDisabled();
    });
  });

  it('does not submit when input is empty', () => {
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

    render(<HomePage />);
    const input = screen.getByTestId('address-input') as HTMLInputElement;
    const button = screen.getByTestId('search-button');

    fireEvent.change(input, { target: { value: 'New York' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('location-result')).toBeInTheDocument();
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => [],
    });

    fireEvent.change(input, { target: { value: 'XyzNotAPlace123' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.queryByTestId('location-result')).not.toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toHaveTextContent('Location not found');
    });
  });
});
