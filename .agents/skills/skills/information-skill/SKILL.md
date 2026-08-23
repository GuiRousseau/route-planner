# Information Skill

A reusable skill for retrieving, analyzing, and summarizing information to support agent decision-making and planning.

## Purpose

- Retrieve and analyze information for requirement clarification
- Perform code review and analysis (readability, structure, test coverage)
- Design component architecture and workflows
- Synthesize complex data into actionable insights
- Validate code against established standards

## Responsibilities

### Requirement Analysis
- Clarify and document user requirements for component development
- Identify implicit requirements and edge cases
- Ask clarifying questions when requirements are ambiguous
- Document assumptions and constraints

### Code Review & Analysis
- Analyze code for readability issues (function length, variable naming, complex logic)
- Validate test structure and coverage patterns
- Assess code against component creation rules
- Identify opportunities for improvement
- Provide actionable feedback with specific line references

### Design & Planning
- Design component architecture based on requirements
- Plan multi-step development workflows
- Estimate complexity and effort
- Create implementation roadmaps
- Identify skill dependencies and ordering

### Validation
- Validate code against naming conventions (PascalCase components, camelCase functions)
- Check for self-documenting code patterns
- Verify JSDoc comments on complex logic
- Assess test coverage adequacy
- Validate package.json scripts for selected package manager

## Integration with Developer Agent

This skill is invoked by the developer-agent during:

1. **Planning Phase** - Analyze requirements and design workflow
2. **Code Review Phase** - Review generated component code and tests
3. **Validation Phase** - Verify code meets all standards and coverage goals

## Input Contract

The skill receives:
```typescript
{
  // The type of operation
  operation: 'analyze-requirements' | 'design-architecture' | 'review-code' | 'validate-coverage',
  
  // Operation-specific context
  requirements?: string[],                    // For requirement analysis
  componentName?: string,                     // For design
  code?: string,                              // For code review
  testFile?: string,                          // For test validation
  packageManager?: {
    type: 'bun' | 'npm',
    installCommand: string,
    testCommand: string,
    buildCommand: string
  },
  
  // Standards and rules
  framework?: 'react',
  maxFunctionLength?: number,                 // Default: 50 lines
  minTestCoverage?: number,                   // Default: 80%
}
```

## Output Contract

The skill returns:
```typescript
{
  // Operation result
  success: boolean,
  operation: string,
  
  // Findings or plan
  findings?: {
    issues: Array<{
      type: 'naming' | 'length' | 'coverage' | 'documentation' | 'structure',
      severity: 'error' | 'warning' | 'info',
      message: string,
      line?: number,
      suggestion?: string
    }>,
    score: number,                           // 0-100
    summary: string
  },
  
  plan?: {
    steps: Array<{
      step: number,
      description: string,
      skill: string,
      estimatedEffort: string
    }>,
    complexity: 'low' | 'medium' | 'high'
  },
  
  // Validation results
  validation?: {
    passed: boolean,
    coverage: number,
    testCount: number,
    issues: string[]
  },
  
  error?: string
}
```

## Standards Enforced

- **React Specialization**: React 18+ and Next.js support detection
- **Component Naming**: PascalCase, descriptive (e.g., `UserProfileCard`)
- **Function Naming**: camelCase verbs (e.g., `handleSubmit`, `fetchData`)
- **Variable Naming**: camelCase nouns (e.g., `isLoading`, `userData`)
- **Function Length**: Max 50 lines; complex functions should be broken down
- **Test Coverage**: Minimum 80% per component
- **Documentation**: JSDoc for exported functions and complex logic
- **Package Manager**: Supports Bun (preferred) and npm (fallback)
- **No Single-Letter Variables**: Except for loop indices
- **Readability First**: Clear code over micro-optimizations

## Testing Queries

The skill validates test quality by checking:
- `describe` blocks exist for test suites
- `it` or `test` blocks exist for individual test cases
- `beforeEach`/`afterEach` hooks for setup/teardown
- Test names describe expected behavior (not implementation)
- User-centric test queries (React Testing Library patterns)
- Mock data is clearly documented

## Usage Example

```typescript
// Requirement analysis
const result = await informationSkill.execute({
  operation: 'analyze-requirements',
  requirements: ['Display user profile', 'Allow editing', 'Show avatar'],
  framework: 'react',
  packageManager: { type: 'bun', ... }
});

// Code review
const review = await informationSkill.execute({
  operation: 'review-code',
  code: componentCode,
  framework: 'react'
});

// Design architecture
const design = await informationSkill.execute({
  operation: 'design-architecture',
  componentName: 'UserProfileCard',
  requirements: [...],
  complexity: 'medium'
});

// Validate test coverage
const validation = await informationSkill.execute({
  operation: 'validate-coverage',
  testFile: testCode,
  componentName: 'UserProfileCard'
});
```

## Next Steps

- [ ] Implement requirement analysis logic
- [ ] Implement code review analyzer with AST parsing
- [ ] Implement test validator with regex/AST patterns
- [ ] Add TypeScript compiler integration for type validation
- [ ] Add ESLint rule integration for automated checks
- [ ] Create knowledge base of component patterns and anti-patterns
- [ ] Add performance analysis for optimization suggestions
- [ ] Support for Storybook documentation validation
