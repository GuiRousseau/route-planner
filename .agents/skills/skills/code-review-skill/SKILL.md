# Code Review Skill

A reusable skill for performing comprehensive code analysis and review across different programming languages and frameworks.

## Purpose

- Analyze code for quality, readability, and maintainability
- Identify bugs, anti-patterns, and code smells
- Validate code against established standards and best practices
- Provide actionable feedback with specific improvements
- Assess code complexity and structure

## Responsibilities

### Readability Analysis
- Check function and variable naming conventions
- Identify functions exceeding length limits
- Analyze code comments and documentation
- Assess structural clarity and organization
- Detect overly complex conditional logic

### Quality Assessment
- Identify potential bugs and edge cases
- Detect performance anti-patterns
- Check for proper error handling
- Validate type safety (for TypeScript/Python)
- Assess test coverage adequacy

### Best Practices Validation
- Verify adherence to naming conventions
- Check for consistent code patterns
- Identify security vulnerabilities
- Validate architectural patterns
- Assess framework-specific best practices

### Standards Compliance
- Verify code against language standards
- Check alignment with project rules
- Validate against accessibility standards (where applicable)
- Assess documentation completeness
- Check for deprecated patterns

## Input Contract

```typescript
{
  // Code analysis operation
  operation: 'analyze-readability' | 'validate-quality' | 'check-standards' | 'assess-complexity',
  
  // Code to review
  code: string,
  language: 'typescript' | 'javascript' | 'python' | 'java' | 'go' | 'rust' | string,
  
  // Optional context
  framework?: string,                    // 'react', 'django', 'spring', etc.
  relatedCode?: string,                  // Tests, types, etc.
  
  // Standards to check against
  rules?: string[],                      // Which rule sets to apply
  
  // Standards configuration
  standards?: {
    maxFunctionLength?: number,          // Default: 50
    maxComplexity?: number,              // Default: 10 (cyclomatic complexity)
    minDocumentation?: boolean,          // Default: true
    requiredNamingConventions?: {
      [key: string]: string              // 'functions': 'camelCase', etc.
    }
  }
}
```

## Output Contract

```typescript
{
  // Operation result
  success: boolean,
  operation: string,
  language: string,
  
  // Analysis findings
  findings: {
    // Issues identified
    issues: Array<{
      type: 'naming' | 'length' | 'complexity' | 'documentation' | 'pattern' | 'security' | 'performance' | 'error-handling',
      severity: 'error' | 'warning' | 'info',
      message: string,
      line?: number,
      lineContent?: string,
      suggestion?: string,
      link?: string                     // Link to standard or documentation
    }>,
    
    // Quality metrics
    metrics: {
      readabilityScore: number,          // 0-100
      complexityScore: number,           // 0-100
      docScore: number,                  // 0-100 coverage
      overallScore: number               // 0-100
    },
    
    // Summary
    summary: string,
    strengths: string[],
    improvements: string[]
  },
  
  // Rules applied
  rulesApplied?: string[],
  
  error?: string
}
```

## Standards Enforced

### Naming Conventions
- **Functions/Methods**: Descriptive, verb-based (e.g., `fetchData`, `handleClick`)
- **Variables**: Descriptive nouns (e.g., `userData`, `isLoading`)
- **Classes/Interfaces**: PascalCase (e.g., `UserProfile`, `APIResponse`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)
- **Booleans**: Prefixed with `is`, `has`, `should`, `can`
- **No Single-Letter Variables**: Except for loop indices

### Code Structure
- **Function Length**: Maximum 50 lines (language-dependent, flexible)
- **Complexity**: Cyclomatic complexity ≤ 10
- **Nesting**: Maximum 3-4 levels deep
- **Line Length**: Reasonable (typically 80-120 characters)
- **File Organization**: Clear separation of concerns

### Documentation
- **Comments**: Explain "why", not "what"
- **Function Docs**: JSDoc/docstrings for all exported functions
- **Complex Logic**: Inline comments for non-obvious code
- **Type Information**: Types documented (TypeScript, Python type hints)
- **Examples**: Usage examples for public APIs

### Error Handling
- **Exception Handling**: Proper try/catch or error boundaries
- **Null Checks**: Defensive programming for null/undefined
- **Edge Cases**: Handling of boundary conditions
- **User Feedback**: Clear error messages
- **Recovery**: Graceful degradation or fallback behavior

## Common Issues Detected

- ❌ Functions exceeding length limits
- ❌ Single-letter variable names (except loops)
- ❌ Missing or inadequate documentation
- ❌ Complex nested conditionals
- ❌ Poor error handling
- ❌ Missing null checks
- ❌ Inconsistent naming patterns
- ❌ Code duplication (DRY violations)
- ❌ Premature optimization
- ❌ Magic numbers without explanation

## Scoring

**Readability Score (0-100):**
- Naming conventions: 25 points
- Function length and structure: 25 points
- Documentation quality: 25 points
- Code organization: 25 points

**Complexity Score (0-100):**
- Cyclomatic complexity: 40 points
- Nesting depth: 30 points
- Function length: 30 points

**Documentation Score (0-100):**
- Comment coverage: 50 points
- JSDoc/docstrings: 50 points

**Overall Score:**
- Average of readability, complexity, and documentation

## Usage Example

```typescript
// Analyze readability
const result = await codeReviewSkill.execute({
  operation: 'analyze-readability',
  code: componentCode,
  language: 'typescript',
  framework: 'react'
});

// Validate quality
const quality = await codeReviewSkill.execute({
  operation: 'validate-quality',
  code: componentCode,
  language: 'typescript',
  rules: ['component-creation-rules', 'readability-standards']
});

// Check standards
const standards = await codeReviewSkill.execute({
  operation: 'check-standards',
  code: functionCode,
  language: 'typescript',
  standards: {
    maxFunctionLength: 50,
    maxComplexity: 10
  }
});

// Assess complexity
const complexity = await codeReviewSkill.execute({
  operation: 'assess-complexity',
  code: algorithmCode,
  language: 'go'
});
```

## Next Steps

- [ ] Implement AST-based analysis for each language
- [ ] Add ESLint/Pylint/gofmt integration
- [ ] Implement cyclomatic complexity calculation
- [ ] Add code duplication detection (DRY)
- [ ] Implement metrics aggregation
- [ ] Add security vulnerability detection
- [ ] Create language-specific analysis engines
- [ ] Add performance profiling suggestions
- [ ] Implement pattern recognition for anti-patterns
- [ ] Add code similarity detection across files
