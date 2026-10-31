import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocationResultCard } from './LocationResultCard';

describe('LocationResultCard', () => {
  const mockOnGenerateRoute = jest.fn();

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders location details', () => {
    render(
      <LocationResultCard
        lat={40.7128}
        lon={-74.006}
        displayName="New York, United States"
        onGenerateRoute={mockOnGenerateRoute}
      />
    );

    expect(screen.getByText('Location Found')).toBeInTheDocument();
    expect(screen.getByText('New York, United States')).toBeInTheDocument();
    expect(screen.getByText(/40.712800/)).toBeInTheDocument();
    expect(screen.getByText(/-74.006000/)).toBeInTheDocument();
  });

  it('renders generate route button', () => {
    render(
      <LocationResultCard
        lat={40.7128}
        lon={-74.006}
        displayName="New York, United States"
        onGenerateRoute={mockOnGenerateRoute}
      />
    );

    expect(screen.getByTestId('generate-route-button')).toBeInTheDocument();
    expect(screen.getByText('Generate Running Route')).toBeInTheDocument();
  });

  it('calls onGenerateRoute when button clicked', async () => {
    const user = userEvent.setup();
    render(
      <LocationResultCard
        lat={40.7128}
        lon={-74.006}
        displayName="New York, United States"
        onGenerateRoute={mockOnGenerateRoute}
      />
    );

    const button = screen.getByTestId('generate-route-button');
    await user.click(button);

    expect(mockOnGenerateRoute).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when loading prop is true', () => {
    render(
      <LocationResultCard
        lat={40.7128}
        lon={-74.006}
        displayName="New York, United States"
        onGenerateRoute={mockOnGenerateRoute}
        loading={true}
      />
    );

    const button = screen.getByTestId('generate-route-button');
    expect(button).toHaveTextContent('Generating Route...');
    expect(button).toBeDisabled();
  });

  it('button is enabled when loading is false', () => {
    render(
      <LocationResultCard
        lat={40.7128}
        lon={-74.006}
        displayName="New York, United States"
        onGenerateRoute={mockOnGenerateRoute}
        loading={false}
      />
    );

    const button = screen.getByTestId('generate-route-button');
    expect(button).not.toBeDisabled();
  });
});
