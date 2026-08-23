# Code Generation Skill

A reusable skill for generating, transforming, and refactoring code across different programming languages and frameworks.

## Purpose

- Generate code from specifications and templates
- Transform and refactor existing code
- Improve code quality and maintainability
- Apply consistent patterns and standards
- Generate framework-specific implementations

## Responsibilities

### Code Generation
- Generate functions and classes from specifications
- Create boilerplate code following patterns
- Generate configuration files
- Create typed structures and interfaces
- Generate implementations from specifications

### Code Transformation
- Apply refactoring patterns (extract function, rename, etc.)
- Modernize code (ES6+, TypeScript, etc.)
- Convert between similar patterns
- Normalize code formatting and style
- Migrate between frameworks or patterns

### Code Quality Improvement
- Extract complex logic into smaller functions
- Improve naming for clarity
- Add documentation and comments
- Remove code duplication
- Improve error handling

### Pattern Application
- Apply framework-specific patterns (React, Django, Spring, etc.)
- Follow language idioms (Go, Rust, Python, etc.)
- Implement design patterns (Factory, Observer, etc.)
- Follow project conventions and standards
- Maintain consistency with existing code

## Input Contract

```typescript
{
  // Code generation operation
  operation: 'generate-function' | 'generate-class' | 'refactor' | 'transform' | 'apply-pattern',
  
  // Target language and framework
  language: 'typescript' | 'javascript' | 'python' | 'java' | 'go' | 'rust' | string,
  framework?: string,                    // 'react', 'django', 'spring', etc.
  
  // Content
  code?: string,                         // Existing code to refactor
  specification?: string,                // Spec for generation
  pattern?: string,                      // Pattern to apply
  template?: string,                     // Custom template
  
  // Options
  options?: {
    style?: 'functional' | 'oop' | 'declarative',
    format?: 'compact' | 'verbose' | 'documented',
    includeTests?: boolean,
    includeTypes?: boolean,              // For TypeScript, Python hints
    includeDocumentation?: boolean,
    targetVersion?: string               // Language/framework version
  },
  
  // Standards
  standards?: {
    naming?: {
      [key: string]: string              // 'functions': 'camelCase'
    },
    maxFunctionLength?: number,
    frameworkPatterns?: string[]         // Patterns to follow
  },
  
  // Context
  context?: {
    existingCode?: string,               // Related code for consistency
    imports?: string[],                  // Required imports/dependencies
    dependencies?: { [key: string]: string }  // Package versions
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
  
  // Generated or refactored code
  code?: string,                         // Main generated code
  
  // Related artifacts
  artifacts?: Array<{
    type: 'test' | 'type' | 'config' | 'documentation' | 'integration',
    filePath?: string,
    content: string,
    language?: string
  }>,
  
  // Metadata
  metadata?: {
    functionCount?: number,
    complexity?: number,
    testCount?: number,
    documentationCoverage?: number,
    estimatedCoverage?: number
  },
  
  // Refactoring changes (if refactoring)
  changes?: Array<{
    type: 'rename' | 'extract' | 'inline' | 'simplify' | 'documentation',
    description: string,
    before: string,
    after: string,
    line?: number
  }>,
  
  // Improvements applied
  improvements?: string[],
  
  // Generation notes
  notes?: string[],
  
  error?: string,
  warnings?: string[]
}
```

## Standards Enforced

### Function Generation
- **Naming**: Descriptive, verb-based (e.g., `fetchUser`, `calculateTotal`)
- **Length**: Maximum 50 lines
- **Complexity**: Cyclomatic complexity ≤ 10
- **Parameters**: Maximum 3-4 parameters (use objects for more)
- **Return Types**: Clear return type declarations
- **Documentation**: JSDoc/docstrings for all functions

### Class/Type Generation
- **Naming**: PascalCase (e.g., `UserService`, `APIResponse`)
- **Interface**: Clear public/private members
- **Cohesion**: Related functionality grouped together
- **Dependencies**: Explicit dependency injection
- **Documentation**: JSDoc for all public members

## Language-Specific Generation

### TypeScript/JavaScript
- Full type annotations (TypeScript)
- Async/await patterns
- Promise handling
- Proper module exports
- React component patterns (if React)

### Python
- Type hints (Python 3.5+)
- Docstring format
- Exception types
- Import organization

### Go
- Idiomatic Go (CamelCase, interfaces)
- Error handling (error return values)
- Struct tags
- Package organization

### Java
- Naming conventions (camelCase methods, PascalCase classes)
- Access modifiers
- Exception hierarchy
- Dependency injection (Spring, Guice)

## Framework-Specific Generation

### React
- Functional components with hooks
- Proper prop interfaces
- React Testing Library patterns
- Accessibility attributes (ARIA)
- Performance optimization (where appropriate)

### Django
- Model definitions
- View/ViewSet patterns
- Serializer usage
- URL routing
- Test case structure

### Spring Boot
- Controller/Service/Repository patterns
- Dependency injection
- Exception handling
- Validation annotations
- Test patterns

## Refactoring Patterns

- **Extract Function**: Break long functions into smaller ones
- **Rename**: Improve naming for clarity
- **Simplify Conditionals**: Reduce complexity
- **Remove Duplication**: Apply DRY principle
- **Add Documentation**: Improve clarity
- **Improve Error Handling**: Add missing error cases

## Usage Example

```typescript
// Generate a function
const result = await codeGenerationSkill.execute({
  operation: 'generate-function',
  language: 'typescript',
  specification: 'Fetch user by ID from API, handle errors gracefully',
  options: {
    includeDocumentation: true,
    includeTests: false
  }
});

// Refactor existing code
const refactored = await codeGenerationSkill.execute({
  operation: 'refactor',
  language: 'typescript',
  code: existingFunction,
  options: {
    format: 'documented',
    style: 'functional'
  }
});

// Apply React patterns
const reactCode = await codeGenerationSkill.execute({
  operation: 'apply-pattern',
  language: 'typescript',
  framework: 'react',
  pattern: 'functional-component-with-hooks',
  specification: 'User profile card component with props for name, email, avatar'
});

// Transform to modern syntax
const modern = await codeGenerationSkill.execute({
  operation: 'transform',
  language: 'javascript',
  code: legacyCode,
  options: {
    targetVersion: 'es2020'
  }
});

## Next Steps

- [ ] Implement template engine for code generation
- [ ] Add AST-based code transformation
- [ ] Implement framework-specific generators
- [ ] Add TypeScript compiler integration
- [ ] Implement refactoring patterns
- [ ] Add code duplication detection
- [ ] Create language-specific code generators
- [ ] Add performance optimization suggestions
- [ ] Implement code migration tools
- [ ] Add pattern matching and application
