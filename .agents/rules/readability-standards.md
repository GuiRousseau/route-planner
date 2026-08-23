# Readability Standards

Standards for writing clear, maintainable React component code that prioritizes human readability over micro-optimizations.

## Core Philosophy

**Readability > Performance**

Code is read far more often than it is written. Clarity and maintainability should always take priority over premature optimizations. Only optimize after profiling has identified a genuine bottleneck.

## Code Structure Guidelines

### Function Length

**Rule: No function should exceed 50 lines**

Functions longer than 50 lines are difficult to understand and test. Break complex logic into smaller, focused functions.

```typescript
// ❌ Bad: Function too long (81 lines)
const handleUserFormSubmit = async (formData: UserFormData) => {
  // Validation
  if (!formData.name || formData.name.trim().length === 0) {
    setError('Name is required');
    return;
  }
  
  if (!formData.email || !isValidEmail(formData.email)) {
    setError('Valid email is required');
    return;
  }
  
  // More validation...
  // ... (50+ more lines of logic)
  // API call
  const response = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(formData)
  });
  
  // Result handling
  // ... more code
};

// ✅ Good: Broken into focused functions
const validateUserForm = (formData: UserFormData): string | null => {
  if (!formData.name?.trim()) {
    return 'Name is required';
  }
  if (!formData.email || !isValidEmail(formData.email)) {
    return 'Valid email is required';
  }
  return null;
};

const submitUserForm = async (formData: UserFormData): Promise<User> => {
  const response = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(formData)
  });
  return response.json();
};

const handleUserFormSubmit = async (formData: UserFormData) => {
  const error = validateUserForm(formData);
  if (error) {
    setError(error);
    return;
  }
  
  try {
    const user = await submitUserForm(formData);
    setUser(user);
  } catch (err) {
    setError('Failed to create user');
  }
};
```

### Variable Naming

**Rule: All variable names must be descriptive and self-documenting**

Variable names should clearly convey intent. Single-letter variables are only acceptable for loop indices.

```typescript
// ❌ Bad: Single-letter or unclear names
const u = userData;
const i = isLoading;
const fn = (d) => d.map(x => x.n);
const t = 1000;

// ✅ Good: Clear, descriptive names
const userData = fetchedUser;
const isLoading = fetchInProgress;
const formatNames = (users) => users.map(user => user.name);
const requestTimeoutMs = 1000;

// ✅ Acceptable: Loop indices (single letters OK)
for (let i = 0; i < items.length; i++) {
  process(items[i]);
}

// ✅ Better: Descriptive loop variables when possible
items.forEach((item) => {
  process(item);
});
```

**Naming Conventions:**
- **Components**: PascalCase, descriptive nouns/adjectives
  - `UserProfileCard`, `ErrorBoundary`, `LoadingSpinner`
- **Functions**: camelCase, verb + object
  - `handleClick`, `fetchUserData`, `validateEmail`
- **Variables**: camelCase, noun-based
  - `isLoading`, `userData`, `errorMessage`
- **Constants**: UPPER_SNAKE_CASE
  - `MAX_RETRY_ATTEMPTS`, `DEFAULT_TIMEOUT_MS`
- **Booleans**: Start with `is`, `has`, `should`, `can`
  - `isVisible`, `hasError`, `shouldRefresh`, `canSubmit`

### Function Parameters

**Rule: Functions should have ≤3 parameters**

More than 3 parameters suggests the function is doing too much. Use objects to group related parameters.

```typescript
// ❌ Bad: Too many parameters
const createUser = (
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  address: string,
  city: string,
  state: string,
  zipCode: string
) => { ... };

// ✅ Good: Group related parameters
interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

const createUser = (formData: UserFormData) => { ... };
```

### Comments and Documentation

**Rule: Comment the "why", not the "what"**

Code should be self-documenting. Comments should explain the reasoning or non-obvious logic, not repeat what the code does.

```typescript
// ❌ Bad: Comment repeats the code
// Set isLoading to true
setIsLoading(true);

// ✅ Good: Comment explains why
// Disable form submission while API call is in progress
setIsLoading(true);

// ❌ Bad: Explaining obvious logic
// Increment counter by 1
counter++;

// ✅ Good: Explaining non-obvious logic
// Buffer requests for 500ms to avoid excessive API calls during rapid user input
debounce(handleSearch, 500);
```

### Complex Logic Comments

When logic is non-obvious, add explanatory comments:

```typescript
// ✅ Good: Explaining complex algorithm
// We use a Set to track seen IDs and filter duplicates in O(n) time
// instead of Array.includes() which would be O(n²)
const uniqueIds = Array.from(
  new Set(userIds)
);

// ✅ Good: Explaining business logic
// Users created today should see onboarding flow
// (Today in user's timezone, not server timezone)
const hasSeenOnboarding = dayjs.tz(user.createdAt, user.timezone).isSame(
  dayjs.tz(undefined, user.timezone),
  'day'
);
```

## React Component Patterns

### Component File Structure

```typescript
/**
 * UserCard component
 *
 * Displays user profile information with edit and delete actions.
 * Handles callbacks for user interactions.
 *
 * @example
 * <UserCard user={userData} onEdit={handleEdit} onDelete={handleDelete} />
 */

// Imports
import React, { FC } from 'react';
import styles from './UserCard.module.css';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

interface UserCardProps {
  /** User data to display */
  user: User;
  /** Callback when edit button is clicked */
  onEdit: (userId: string) => void;
  /** Callback when delete button is clicked */
  onDelete: (userId: string) => void;
}

// Component
const UserCard: FC<UserCardProps> = ({ user, onEdit, onDelete }) => {
  // Event handlers
  const handleEditClick = () => onEdit(user.id);
  const handleDeleteClick = () => onDelete(user.id);

  // Render
  return (
    <article className={styles.card}>
      <img src={user.avatarUrl} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <button onClick={handleEditClick}>Edit</button>
      <button onClick={handleDeleteClick}>Delete</button>
    </article>
  );
};

// Export
export { UserCard, type UserCardProps };
```

### Props Documentation

Always document props with JSDoc:

```typescript
interface UserCardProps {
  /** User object with id, name, email, and avatar URL */
  user: User;
  
  /** Called when edit button is clicked with user ID */
  onEdit: (userId: string) => void;
  
  /** Optional CSS class name for custom styling */
  className?: string;
  
  /** Show loading indicator and disable actions */
  isLoading?: boolean;
}
```

### Conditional Rendering

Keep conditional rendering logic simple and clear:

```typescript
// ❌ Bad: Complex nested ternary (hard to read)
return (
  <div>
    {isLoading ? (
      <Spinner />
    ) : error ? (
      <ErrorMessage message={error} />
    ) : user ? (
      <UserInfo user={user} />
    ) : (
      <EmptyState />
    )}
  </div>
);

// ✅ Good: Extract to separate functions
const renderContent = () => {
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  if (user) return <UserInfo user={user} />;
  return <EmptyState />;
};

return <div>{renderContent()}</div>;

// ✅ Also good: Explicit if statements
return (
  <div>
    {isLoading && <Spinner />}
    {error && <ErrorMessage message={error} />}
    {!isLoading && !error && user && <UserInfo user={user} />}
    {!isLoading && !error && !user && <EmptyState />}
  </div>
);
```

### Event Handlers

Always name event handlers clearly:

```typescript
// ❌ Bad: Vague names
const onClick = () => { ... };
const on = () => { ... };
const handle = () => { ... };

// ✅ Good: Descriptive names
const handleEditButtonClick = () => { ... };
const handleFormSubmit = (e: React.FormEvent) => { ... };
const handleUserDelete = (userId: string) => { ... };
```

## Performance Considerations

### Rule: No Optimization Without Profiling

Never optimize before measuring. Premature optimization:
- Makes code harder to read
- Often doesn't provide meaningful gains
- Creates maintenance burden
- Introduces subtle bugs

### Acceptable Optimization Patterns

**After profiling identifies bottleneck:**

```typescript
// ✅ Optimization with clear reason
// Re-render is expensive; memoize to prevent unnecessary renders
// Measured 40% reduction in render time with large user lists
export const UserList = memo(({ users }: Props) => {
  return (
    <ul>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </ul>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if users changed
  return prevProps.users === nextProps.users;
});

// ✅ Document expensive computation with clear reason
// Sorting is expensive for large lists; memoize to prevent re-sorting
const sortedUsers = useMemo(() => {
  return [...users].sort((a, b) => a.name.localeCompare(b.name));
}, [users]);
```

### Anti-Pattern: Premature Optimization

```typescript
// ❌ Premature optimization: Hard to read, likely unmeasured benefit
const MemoizedUserList = memo(
  UserList,
  (prevProps, nextProps) => {
    // Custom comparison logic that adds complexity
    // without proven performance gain
    return (
      prevProps.users.length === nextProps.users.length &&
      prevProps.users.every((user, idx) => 
        user.id === nextProps.users[idx].id
      )
    );
  }
);
```

## Avoiding "Clever" Code

### Rule: Choose Clarity Over Cleverness

Clever code is hard to maintain. Always prefer clear, straightforward implementations.

```typescript
// ❌ Clever but hard to understand
const getUpdatedArray = (arr, idx, val) =>
  idx < 0 || idx >= arr.length ? arr : 
  [...arr.slice(0, idx), val, ...arr.slice(idx + 1)];

// ✅ Clear and explicit
const updateArrayAtIndex = (
  array: T[],
  index: number,
  newValue: T
): T[] => {
  if (index < 0 || index >= array.length) {
    return array; // Return unchanged if index out of bounds
  }
  
  const updatedArray = [...array];
  updatedArray[index] = newValue;
  return updatedArray;
};

// ❌ Clever: Over-abbreviated function names
const compose = (fns) => (x) => fns.reduceRight((v, f) => f(v), x);
const pipe = (fns) => (x) => fns.reduce((v, f) => f(v), x);

// ✅ Clear: Explicit implementation
const applyTransformations = (value: T, transformations: Array<(v: T) => T>): T => {
  let result = value;
  for (const transform of transformations) {
    result = transform(result);
  }
  return result;
};
```

## File Organization

### Rule: One Component Per File

Each file should have a single responsibility:

```
src/components/
├── UserCard/
│   ├── UserCard.tsx           # Component only
│   ├── UserCard.test.tsx      # Tests
│   ├── UserCard.module.css    # Styles (if needed)
│   └── index.ts               # Exports
│
├── UserList/
│   ├── UserList.tsx
│   ├── UserList.test.tsx
│   └── index.ts
```

### index.ts Files

Use barrel exports for clean imports:

```typescript
// src/components/UserCard/index.ts
export { UserCard } from './UserCard';
export type { UserCardProps } from './UserCard';

// Usage: Clean import path
import { UserCard } from 'src/components/UserCard';
```

## Code Review Checklist - Readability

- [ ] No function exceeds 50 lines
- [ ] Variable names are descriptive (no single letters except loop indices)
- [ ] Component names follow PascalCase convention
- [ ] Function names follow camelCase and describe action
- [ ] Boolean variables start with `is`, `has`, `should`, or `can`
- [ ] Comments explain "why", not "what"
- [ ] Complex logic has explanatory comments
- [ ] Props are documented with JSDoc
- [ ] Conditional rendering is easy to follow
- [ ] Event handlers have clear, descriptive names
- [ ] No premature optimizations without profiling evidence
- [ ] One responsibility per file
- [ ] TypeScript types are explicit and clear
- [ ] No "clever" code; clarity prioritized
- [ ] Code follows established naming conventions

## Summary

✅ **DO:**
- Write code for humans to read first
- Use descriptive, clear names
- Break complex logic into smaller functions
- Comment the "why", not the "what"
- Organize files by responsibility
- Optimize only after profiling

❌ **DON'T:**
- Use single-letter variable names (except loops)
- Write functions longer than 50 lines
- Use nested ternaries or complex conditionals
- Optimize before profiling
- Write "clever" code
- Put multiple responsibilities in one file
