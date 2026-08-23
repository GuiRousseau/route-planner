# Action Skill

A reusable skill for executing actions, including component generation, test creation, and code refactoring.

## Purpose

- Generate React components with TypeScript
- Create comprehensive test suites
- Execute safe, validated side effects
- Perform code generation and transformations
- Report results and any errors back to the calling agent

## Responsibilities

### Component Generation
- Generate TypeScript React components based on specifications
- Create proper component structure with clear props interfaces
- Add JSDoc documentation to components
- Generate semantic HTML with accessibility attributes (ARIA labels)
- Support for functional components with React hooks
- Configure build and test scripts for selected package manager

### Test Suite Creation
- Generate Jest test files matching component specs
- Create React Testing Library test queries (user-centric, not implementation-detail)
- Include comprehensive test scenarios:
  - Component renders without errors
  - Props handling (valid and invalid)
  - User interactions and callbacks
  - Conditional rendering
  - Error states and edge cases
- Add explanatory comments for complex test setups
- Ensure 80%+ code coverage

### Code Refactoring
- Improve function and variable naming
- Extract complex logic into smaller functions
- Add explanatory comments for non-obvious code
- Maintain or improve test coverage during refactoring
- Generate readability improvements without changing behavior

### Package Manager Integration
- Accept package manager configuration (Bun or npm)
- Use appropriate commands when needed:
  - Bun: `bun install`, `bun run test`, `bun run build`
  - npm: `npm install`, `npm run test`, `npm run build`
- Generate package.json scripts for the selected package manager
- Create appropriate lock file references
- Validate project structure against detected package manager

## Integration with Developer Agent

This skill is invoked by the developer-agent during:

1. **Component Implementation Phase** - Generate component code and structure
2. **Test Creation Phase** - Generate test suite with comprehensive coverage
3. **Documentation Phase** - Add inline comments and JSDoc
4. **Refactoring Phase** - Improve code readability and structure

## Input Contract

The skill receives:
```typescript
{
  // The type of action to execute
  action: 'generate-component' | 'generate-tests' | 'refactor-code' | 'add-documentation',
  
  // Component/code context
  componentName: string,                      // PascalCase component name
  specification?: string,                     // Component spec or description
  requirements?: string[],                    // List of requirements
  code?: string,                              // Existing code to refactor
  testFile?: string,                          // Existing test file
  
  // Package manager context
  packageManager: {
    type: 'bun' | 'npm',
    installCommand: string,
    runCommand: string,
    testCommand: string,
    buildCommand: string
  },
  
  // Development standards
  framework?: 'react',
  targetCoverage?: number,                    // Default: 80
  maxFunctionLength?: number,                 // Default: 50
  
  // Additional options
  includeHooks?: boolean,                     // Support React hooks
  includeTypescript?: boolean,                // Use TypeScript (default: true)
  includeAccessibility?: boolean,             // Add ARIA attributes (default: true)
  includeRefactoring?: boolean,               // Improve existing code
  includeDocumentation?: boolean,             // Add JSDoc comments
}
```

## Output Contract

The skill returns:
```typescript
{
  // Operation result
  success: boolean,
  action: string,
  
  // Generated content
  component?: {
    code: string,                             // Generated component code
    filePath: string,                         // Suggested file path
    props: {
      name: string,
      description: string,
      type: string,
      required: boolean
    }[],
    exports: string[]                         // Exported names
  },
  
  testFile?: {
    code: string,                             // Generated test code
    filePath: string,                         // Suggested file path
    testCases: {
      name: string,
      description: string
    }[],
    estimatedCoverage: number                 // Estimated % coverage
  },
  
  refactoringChanges?: {
    improvements: Array<{
      type: 'naming' | 'extraction' | 'documentation' | 'structure',
      description: string,
      before: string,
      after: string
    }>,
    testCoverageMaintained: boolean,
    summary: string
  },
  
  packageManager?: {
    type: 'bun' | 'npm',
    scripts?: {
      [key: string]: string
    },
    devDependencies?: {
      [key: string]: string
    }
  },
  
  error?: string,
  warnings?: string[]
}
```

## Standards Enforced

### Component Standards
- **Naming**: PascalCase, descriptive (e.g., `UserProfileCard`)
- **Structure**: One component per file, clear props interface
- **Documentation**: JSDoc header for all exported components
- **Accessibility**: ARIA labels on interactive elements
- **TypeScript**: Full type safety with prop interfaces
- **Hooks**: Functional components preferred
- **Props**: Clear, well-documented with JSDoc

### Test Standards
- **File Naming**: `<ComponentName>.test.tsx`
- **Structure**: One `describe` block per component
- **Coverage**: Minimum 80% code coverage
- **Test Names**: Describe behavior, not implementation
- **Queries**: Use React Testing Library user-centric queries
- **Setup**: Clear `beforeEach`/`afterEach` for common setup
- **Mocking**: Document mock data and implementations

### Refactoring Standards
- **Naming**: Improve variable and function names for clarity
- **Length**: Break functions exceeding 50 lines
- **Comments**: Add explanatory comments for complex logic
- **Coverage**: Never reduce test coverage
- **No Premature Optimization**: Only improve readability

### Package Manager Standards
- **Bun Projects**: Use `bun run` pattern in scripts
- **npm Projects**: Use `npm run` pattern in scripts
- **Lock Files**: Respect existing lock file type
- **DevDependencies**: Include testing libraries (Jest, React Testing Library)
- **Scripts**: Provide dev, build, test, and type-check scripts

## Usage Example

```typescript
// Generate a component
const result = await actionSkill.execute({
  action: 'generate-component',
  componentName: 'UserProfileCard',
  specification: 'Display user profile with avatar, name, email, and edit button',
  requirements: [
    'Display user avatar and name',
    'Show user email',
    'Handle edit button click',
    'Support custom styling'
  ],
  framework: 'react',
  packageManager: { type: 'bun', ... }
});

// Generate tests
const tests = await actionSkill.execute({
  action: 'generate-tests',
  componentName: 'UserProfileCard',
  code: componentCode,
  packageManager: { type: 'bun', ... }
});

// Refactor for readability
const refactored = await actionSkill.execute({
  action: 'refactor-code',
  code: existingCode,
  testFile: existingTestCode,
  includeDocumentation: true
});

// Add documentation
const documented = await actionSkill.execute({
  action: 'add-documentation',
  code: componentCode,
  testFile: testCode
});
```

## Next Steps

- [ ] Implement component generation using TypeScript compiler API
- [ ] Implement test generation with Jest/React Testing Library patterns
- [ ] Add AST-based refactoring for code transformations
- [ ] Add support for component composition patterns
- [ ] Implement style generation (CSS-in-JS, Tailwind, etc.)
- [ ] Add Storybook story generation
- [ ] Support for component prop validation and PropTypes
- [ ] Integration with Prettier for code formatting
- [ ] Support for monorepo component generation
