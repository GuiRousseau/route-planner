# Testing Requirements

Comprehensive testing standards for React component development using Jest and React Testing Library.

## Core Testing Philosophy

All components must follow a **test-first approach**:
- Tests should be created alongside or before implementation
- Tests serve as specification and documentation
- Minimum 80% code coverage required per component
- Test names describe expected behavior, not implementation details

## Test Structure Requirements

### Describe Blocks (Test Suites)

Each component must have at least one `describe` block:

```typescript
describe('UserCard', () => {
  // All tests for UserCard go here
});
```

**Rules:**
- One `describe` per component or major feature
- Describe block name matches component name
- Use nested `describe` blocks for related test groups

### Test Cases (it/test Blocks)

Each test case must have a clear, human-readable name:

```typescript
it('displays user name from props', () => {
  // Test implementation
});

it('calls onEdit callback when edit button is clicked', () => {
  // Test implementation
});

it('renders error state when user data is invalid', () => {
  // Test implementation
});
```

**Rules:**
- Test name describes the expected behavior
- Use "should" or descriptive phrases (e.g., "displays", "calls", "renders")
- No implementation details in test names
- One behavior per test (avoid AND statements)

### Setup and Teardown

Use `beforeEach`/`afterEach` for common setup:

```typescript
describe('UserCard', () => {
  let mockUser: User;

  beforeEach(() => {
    mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      avatarUrl: 'https://example.com/avatar.jpg'
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders user name', () => {
    render(<UserCard user={mockUser} onEdit={jest.fn()} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

**Rules:**
- Set up common test data in `beforeEach`
- Clear mocks in `afterEach`
- Avoid shared state that affects test independence
- Each test should pass in isolation

## Comprehensive Test Scenarios

Every component test file should cover the following areas:

### 1. Component Renders
```typescript
it('renders without errors', () => {
  render(<UserCard user={mockUser} onEdit={jest.fn()} />);
  expect(screen.getByText('John Doe')).toBeInTheDocument();
});
```

**Coverage:**
- Component renders with valid props
- No console errors or warnings
- All expected elements are present

### 2. Props Handling - Valid Cases
```typescript
it('displays all user properties', () => {
  render(<UserCard user={mockUser} onEdit={jest.fn()} />);
  expect(screen.getByText('john@example.com')).toBeInTheDocument();
  expect(screen.getByAltText('John Doe')).toBeInTheDocument();
});

it('displays custom CSS class when provided', () => {
  const { container } = render(
    <UserCard user={mockUser} onEdit={jest.fn()} className="custom" />
  );
  expect(container.querySelector('.custom')).toBeInTheDocument();
});
```

**Coverage:**
- Each prop is used correctly
- Props are rendered/used as expected
- Optional props work correctly

### 3. Props Handling - Invalid Cases
```typescript
it('handles missing user email gracefully', () => {
  const userWithoutEmail = { ...mockUser, email: null };
  render(<UserCard user={userWithoutEmail} onEdit={jest.fn()} />);
  expect(screen.queryByText('null')).not.toBeInTheDocument();
});

it('does not crash with null user object', () => {
  render(<UserCard user={null} onEdit={jest.fn()} />);
  // Should render safely or show fallback UI
});
```

**Coverage:**
- Edge cases and missing data
- Type mismatches
- Null/undefined handling

### 4. User Interactions
```typescript
it('calls onEdit callback when edit button is clicked', () => {
  const handleEdit = jest.fn();
  render(<UserCard user={mockUser} onEdit={handleEdit} />);
  
  const editButton = screen.getByRole('button', { name: /edit/i });
  fireEvent.click(editButton);
  
  expect(handleEdit).toHaveBeenCalledWith(mockUser.id);
});

it('calls onDelete callback with correct ID when delete is clicked', () => {
  const handleDelete = jest.fn();
  render(<UserCard user={mockUser} onDelete={handleDelete} />);
  
  fireEvent.click(screen.getByRole('button', { name: /delete/i }));
  
  expect(handleDelete).toHaveBeenCalledWith(mockUser.id);
});
```

**Coverage:**
- Click handlers and callbacks
- Keyboard interactions (Enter, Space)
- Multiple interactions in sequence

### 5. Conditional Rendering
```typescript
it('shows loading spinner when isLoading prop is true', () => {
  render(<UserCard user={mockUser} isLoading={true} />);
  expect(screen.getByRole('progressbar')).toBeInTheDocument();
  expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
});

it('shows error message when error prop is provided', () => {
  render(<UserCard user={mockUser} error="Failed to load" />);
  expect(screen.getByText('Failed to load')).toBeInTheDocument();
});
```

**Coverage:**
- Different component states (loading, error, success)
- Conditional UI based on props
- State transitions

### 6. Edge Cases and Boundary Conditions
```typescript
it('handles very long user names', () => {
  const longNameUser = {
    ...mockUser,
    name: 'A'.repeat(500)
  };
  render(<UserCard user={longNameUser} onEdit={jest.fn()} />);
  // Should render or truncate gracefully
});

it('handles special characters in user data', () => {
  const specialUser = {
    ...mockUser,
    name: '<script>alert("xss")</script>'
  };
  render(<UserCard user={specialUser} onEdit={jest.fn()} />);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
```

**Coverage:**
- Large data sets
- Special characters
- Boundary values
- Security edge cases (XSS, injection)

## Testing Patterns

### Use React Testing Library Best Practices

**✅ DO - User-centric queries:**
```typescript
// Query by role (most accessible)
screen.getByRole('button', { name: /edit/i })

// Query by label text
screen.getByLabelText('User name')

// Query by displayed text
screen.getByText('John Doe')

// Query by placeholder text
screen.getByPlaceholderText('Enter email')
```

**❌ DON'T - Implementation detail queries:**
```typescript
// Query by className (implementation detail)
container.querySelector('.user-card__name')

// Query by test ID when alternatives exist
screen.getByTestId('user-name')
```

### Mock Data Patterns

Create reusable mock data and factories:

```typescript
// Good: Centralized mock data
const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  avatarUrl: 'https://example.com/avatar.jpg'
};

// Better: Factory function for flexibility
function createMockUser(overrides?: Partial<User>): User {
  return {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatarUrl: 'https://example.com/avatar.jpg',
    ...overrides
  };
}

// Usage: Easy to create variations
it('displays user name', () => {
  const user = createMockUser();
  render(<UserCard user={user} onEdit={jest.fn()} />);
});

it('handles missing email', () => {
  const user = createMockUser({ email: null });
  render(<UserCard user={user} onEdit={jest.fn()} />);
});
```

### Testing Callbacks and Props

```typescript
// Use jest.fn() for mock callbacks
const mockOnEdit = jest.fn();
render(<UserCard user={mockUser} onEdit={mockOnEdit} />);

// Verify callback was called with correct arguments
fireEvent.click(screen.getByText('Edit'));
expect(mockOnEdit).toHaveBeenCalledWith(mockUser.id);
expect(mockOnEdit).toHaveBeenCalledTimes(1);

// Don't call callback multiple times for single action
fireEvent.click(screen.getByText('Edit'));
expect(mockOnEdit).toHaveBeenCalledTimes(1);
```

## Coverage Requirements

### Minimum Coverage: 80%

Coverage targets per component:
- **Statements**: ≥80% - Most code paths executed
- **Branches**: ≥80% - if/else and ternary branches covered
- **Functions**: ≥80% - All functions called at least once
- **Lines**: ≥80% - All executable lines executed

### Coverage Measurement

```bash
# Using Jest with Bun
bun test --coverage

# Using Jest with npm
npm run test -- --coverage
```

### Coverage Report Analysis

```
-----------------------------|---------|---------|---------|---------|
File                          | % Stmts | % Branch| % Funcs | % Lines |
-----------------------------|---------|---------|---------|---------|
UserCard.tsx                  |   95.2  |   93.3  |   100   |   95.2  | ✅
UserCard.test.tsx             |   100   |   100   |   100   |   100   |
-----------------------------|---------|---------|---------|---------|
All files                     |   94.8  |   92.1  |   100   |   94.8  | ✅
-----------------------------|---------|---------|---------|---------|
```

**Red flags:**
- Coverage below 80%
- Large coverage gaps in complex logic
- Missing tests for callback handlers
- No edge case coverage

## Documentation in Tests

### Clear Test Names as Specification

Test names should read like documentation:

```typescript
describe('UserCard', () => {
  it('displays user name, email, and avatar from props', () => { ... });
  it('calls onEdit callback with user ID when edit button is clicked', () => { ... });
  it('renders error message and hides user data when error prop is provided', () => { ... });
  it('shows loading spinner and disables edit button while loading', () => { ... });
  it('handles missing email gracefully by showing placeholder text', () => { ... });
});
```

### Comments for Complex Test Setup

```typescript
describe('UserCard with edit functionality', () => {
  // Mock a user object with all required fields
  const mockUser = createMockUser();
  
  // Mock the onEdit callback to track calls
  const mockOnEdit = jest.fn();

  beforeEach(() => {
    // Reset mock between tests to ensure isolation
    mockOnEdit.mockClear();
  });

  it('updates local state when edit button is clicked', () => {
    // Render the component with mocks
    render(<UserCard user={mockUser} onEdit={mockOnEdit} />);
    
    // Find and click the edit button
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    
    // Verify the callback was called with the correct ID
    expect(mockOnEdit).toHaveBeenCalledWith(mockUser.id);
  });
});
```

## Test File Organization

### Typical Test File Structure

```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserCard } from './UserCard';

// Test fixture: Mock user data
const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  avatarUrl: 'https://example.com/avatar.jpg'
};

describe('UserCard', () => {
  // Test group 1: Rendering
  describe('rendering', () => {
    it('renders without errors', () => { ... });
    it('displays user name, email, and avatar', () => { ... });
  });

  // Test group 2: Props handling
  describe('props validation', () => {
    it('handles missing email gracefully', () => { ... });
    it('handles invalid avatar URL', () => { ... });
  });

  // Test group 3: User interactions
  describe('user interactions', () => {
    it('calls onEdit when edit button is clicked', () => { ... });
    it('calls onDelete when delete button is clicked', () => { ... });
  });

  // Test group 4: States
  describe('states', () => {
    it('shows loading spinner when loading', () => { ... });
    it('shows error message when error occurs', () => { ... });
  });
});
```

## Tools and Configuration

### Jest Configuration for React

```json
{
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "jsdom",
    "roots": ["<rootDir>/src"],
    "testMatch": ["**/__tests__/**/*.ts?(x)", "**/?(*.)+(spec|test).ts?(x)"],
    "collectCoverageFrom": [
      "src/**/*.{ts,tsx}",
      "!src/**/*.d.ts",
      "!src/**/index.ts"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

### Testing Libraries

**Required:**
- `jest` - Test runner
- `@testing-library/react` - React component testing utilities
- `@testing-library/user-event` - User interaction simulation

**Optional but Recommended:**
- `@testing-library/jest-dom` - Extended Jest matchers
- `jest-axe` - Accessibility testing

## Common Testing Mistakes to Avoid

### ❌ Testing Implementation Details
```typescript
// Bad: Tests the implementation
it('sets isLoading state to true', () => {
  const { getByTestId } = render(<UserCard ... />);
  expect(getByTestId('loading-indicator')).toBeInTheDocument();
});

// Good: Tests user-visible behavior
it('shows loading spinner while fetching data', () => {
  render(<UserCard isLoading={true} />);
  expect(screen.getByRole('progressbar')).toBeInTheDocument();
});
```

### ❌ Testing External Dependencies
```typescript
// Bad: Tests HTTP library, not component
it('calls axios with correct URL', () => {
  render(<UserCard userId="1" />);
  expect(axios.get).toHaveBeenCalledWith('/api/users/1');
});

// Good: Mocks the dependency, tests component behavior
it('displays error message when user fetch fails', () => {
  jest.mock('./api', () => ({
    fetchUser: jest.fn().mockRejectedValue(new Error('Failed'))
  }));
  render(<UserCard userId="1" />);
  expect(screen.getByText('Failed to load user')).toBeInTheDocument();
});
```

### ❌ Testing Multiple Behaviors in One Test
```typescript
// Bad: Multiple assertions = multiple behaviors
it('component works', () => {
  render(<UserCard user={mockUser} onEdit={jest.fn()} />);
  expect(screen.getByText('John Doe')).toBeInTheDocument();
  expect(screen.getByText('john@example.com')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Edit'));
  expect(onEdit).toHaveBeenCalled();
});

// Good: One behavior per test
it('displays user name', () => {
  render(<UserCard user={mockUser} />);
  expect(screen.getByText('John Doe')).toBeInTheDocument();
});

it('calls onEdit callback when edit button is clicked', () => {
  render(<UserCard user={mockUser} onEdit={jest.fn()} />);
  fireEvent.click(screen.getByText('Edit'));
  expect(onEdit).toHaveBeenCalled();
});
```

## Summary

✅ **DO:**
- Create tests alongside components
- Use descriptive test names that describe behavior
- Query by user-visible elements (role, label, text)
- Mock external dependencies
- Test user interactions and callbacks
- Cover edge cases and error states
- Maintain ≥80% code coverage
- Keep tests isolated and independent

❌ **DON'T:**
- Query by implementation details (className, test ID when alternatives exist)
- Test multiple behaviors in one test
- Skip testing callbacks and props
- Ignore edge cases
- Create fragile tests that break with refactoring
- Reduce coverage to pass CI/CD
- Copy-paste test code; use factory functions instead
