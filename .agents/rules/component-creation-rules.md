# Developer Agent Rules

## Package Manager Rules

### Rule: Detect and Use Bun When Available
- **Requirement**: Agent detects project package manager preference and uses appropriate commands
- **Detection Method**:
  - Check for `bun.lockb` (Bun lockfile) - indicates Bun project
  - Check for `bunfig.toml` (Bun configuration) - indicates Bun project
  - Check for `package-lock.json` (npm lockfile) - indicates npm project
  - Default to npm if no indicator found
- **Bun Advantages**: Faster installs, built-in bundler, better performance
- **When to Use**:
  - Use Bun for new React projects (recommended)
  - Use npm for existing projects that already use npm
  - Always respect project's existing lock file
- **Commands**:
  - **Bun**: `bun install`, `bun run test`, `bun run build`
  - **npm**: `npm install`, `npm run test`, `npm run build`

### Rule: React Framework Preference
- **Requirement**: Agent specializes in React development
- **Supported Frameworks**:
  - React 18+ (default)
  - Next.js (App Router preferred, Pages Router supported)
- **TypeScript**: Always use TypeScript for new components
- **Package Manager Context**: Pass detected package manager to all skills

## Component Creation Rules

### Rule: Every Component Must Have a Test File
- **Requirement**: For every React component created, a corresponding test file must be generated simultaneously
- **Format**: Component name `Button.tsx` → Test file `Button.test.tsx`
- **Coverage Goal**: Minimum 80% code coverage per component
- **Scope**: Applies to all new components, refactored components, and component rewrites

### Rule: Readable Code Structure First
- **Requirement**: Prioritize code readability and maintainability over performance micro-optimizations
- **Guidelines**:
  - Function length should not exceed 50 lines; break complex logic into smaller functions
  - Variable names must be descriptive (no single letters except loop indices)
  - Complex logic must include explanatory comments
  - Props interfaces must be well-documented with JSDoc

### Rule: Descriptive Naming Conventions
- **Requirement**: All identifiers follow clear naming patterns
- **Component Names**: PascalCase, descriptive adjectives + noun (e.g., `UserProfileCard`, `ErrorBoundary`)
- **Function Names**: camelCase, verb + object (e.g., `fetchUserData`, `handleSubmit`)
- **Variable Names**: camelCase, noun-based, self-documenting (e.g., `isLoading`, `userEmail`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`, `DEFAULT_TIMEOUT`)

## Testing Requirements

### Rule: Test-Driven Component Creation
- **Requirement**: Tests should be created alongside or before components
- **Test Structure**:
  - One `describe` block per component or major feature
  - One `it`/`test` block per behavior or scenario
  - Separate test files for integration and unit tests
  - Use clear, human-readable test descriptions

### Rule: Comprehensive Test Scenarios
- **Requirement**: Test files must cover all major code paths and user interactions
- **Minimum Coverage Areas**:
  - Component renders without errors
  - Props are handled correctly (valid and invalid)
  - User interactions trigger expected behaviors
  - Error states and edge cases
  - Conditional rendering branches
  - Tools: Jest + React Testing Library (prioritize user-centric queries over implementation details)

### Rule: Test File Documentation
- **Requirement**: Test files are part of documentation
- **Guidelines**:
  - Test names describe the expected behavior (e.g., `it('displays loading spinner while fetching data')`)
  - Complex test setups include explanatory comments
  - Mock data is clearly documented
  - Assertions explain what behavior is being verified

## Readability Standards

### Rule: Code Documentation
- **Requirement**: Complex components must include JSDoc blocks
- **Guidelines**:
  - JSDoc for all exported functions and components
  - Parameter descriptions and return types
  - Example usage for complex components
  - Explanation of non-obvious logic

### Rule: File Organization
- **Requirement**: Components and related code are organized logically
- **Structure**:
  ```
  src/components/
    ├── Button/
    │   ├── Button.tsx       (component)
    │   ├── Button.test.tsx  (tests)
    │   ├── Button.styles.ts (styles, if applicable)
    │   └── index.ts         (export)
    └── ...
  ```
- **One Responsibility Per File**: Each file has a single, clear purpose

### Rule: Avoid Performance Premature Optimization
- **Requirement**: Do NOT optimize for performance unless there is a documented performance problem
- **Guidelines**:
  - Use straightforward algorithms over complex "optimized" ones
  - Avoid premature memoization (`React.memo`, `useMemo`) without profiling
  - Use readable loops over obscure functional patterns
  - Err on the side of clarity in conditional logic
- **Exception**: Performance optimizations are allowed only when:
  - A performance issue is identified and measured
  - The optimization is documented with a comment explaining why
  - Tests confirm the optimization doesn't break functionality

## Refactoring Rules

### Rule: Maintain Test Coverage During Refactoring
- **Requirement**: Test files must be updated and coverage must be maintained during refactoring
- **Process**:
  1. Ensure all tests pass before refactoring
  2. Refactor code incrementally
  3. Run tests after each small change
  4. Update tests if behavior changes
  5. Never reduce test coverage

### Rule: Improve Readability in Refactoring
- **Requirement**: Use refactoring as an opportunity to improve readability
- **Actions**:
  - Extract magic numbers into named constants
  - Break long functions into smaller, named functions
  - Add explanatory comments for complex logic
  - Improve variable and function names

## Code Review Checklist

When reviewing React components, verify:

- [ ] Component has a corresponding test file
- [ ] Test file covers major code paths and user interactions
- [ ] Test coverage is >= 80%
- [ ] Function/variable names are descriptive and self-documenting
- [ ] No single-letter variables (except loop indices)
- [ ] Functions are under 50 lines
- [ ] Complex logic has explanatory comments
- [ ] No premature optimizations without performance profiling
- [ ] Component props are documented with JSDoc
- [ ] Exported components have JSDoc descriptions
- [ ] Test names describe expected behavior (not implementation)
- [ ] No implementation details in tests; use user-centric queries
- [ ] Package.json has appropriate scripts for chosen package manager
- [ ] If using Bun: scripts use `bun run` pattern
- [ ] If using npm: scripts use `npm run` pattern

## Package.json Configuration Examples

### With Bun
```json
{
  "name": "my-react-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "bun run --watch src/index.tsx",
    "build": "bun build ./src/index.tsx --outdir ./dist",
    "test": "bun test",
    "test:watch": "bun test --watch",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0"
  }
}
```