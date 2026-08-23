# Test Validation Skill

A reusable skill for analyzing, validating, and measuring test quality and coverage across different testing frameworks and languages.

## Purpose

- Analyze test files for quality and completeness
- Validate test coverage and adequacy
- Identify gaps in test scenarios
- Assess test structure and organization
- Measure test effectiveness

## Responsibilities

### Test Analysis
- Parse test files and identify test cases
- Extract test scenarios and coverage areas
- Analyze test structure (describe blocks, test cases, setup/teardown)
- Identify test patterns and anti-patterns
- Detect missing or inadequate tests

### Coverage Assessment
- Measure test coverage (statements, branches, functions, lines)
- Identify untested code paths
- Assess coverage adequacy
- Recommend coverage improvements
- Track coverage trends

### Test Quality Evaluation
- Check test naming clarity (behavior vs implementation)
- Validate test organization and structure
- Assess mock data usage and reusability
- Evaluate assertion clarity
- Check for test isolation and independence

### Standards Validation
- Verify adherence to testing standards
- Check framework-specific best practices
- Validate test file organization
- Ensure proper setup/teardown
- Verify test documentation

## Input Contract

```typescript
{
  // Test validation operation
  operation: 'analyze-structure' | 'measure-coverage' | 'assess-quality' | 'identify-gaps',
  
  // Test files
  testCode: string,                      // Test file content
  sourceCode?: string,                   // Source code being tested
  
  // Language and framework
  language: 'typescript' | 'javascript' | 'python' | 'java' | 'go' | string,
  framework?: 'jest' | 'pytest' | 'junit' | 'go testing' | string,
  
  // Coverage data (optional)
  coverageReport?: {
    statements: number,                  // 0-100
    branches: number,                    // 0-100
    functions: number,                   // 0-100
    lines: number                        // 0-100
  },
  
  // Standards
  standards?: {
    minCoverage?: number,                // Default: 80
    minDescribeBlocks?: number,          // Default: 1
    minTestCases?: number,               // Default: depends on complexity
    maxTestLength?: number,              // Max lines per test
    requiredSetup?: boolean              // beforeEach/beforeAll
  },
  
  // Options
  options?: {
    detectAntiPatterns?: boolean,
    checkNaming?: boolean,
    validateMocks?: boolean,
    checkDocumentation?: boolean
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
  framework?: string,
  
  // Test analysis
  analysis?: {
    // Structure
    structure: {
      describeBlocks: number,            // Number of describe blocks
      testCases: number,                 // Number of it/test blocks
      setupBlocks: number,               // beforeEach/beforeAll
      teardownBlocks: number,            // afterEach/afterAll
      mocks: number,                     // Number of mocks/stubs
      assertions: number                 // Estimated number of assertions
    },
    
    // Test scenarios
    scenarios: Array<{
      name: string,
      type: 'rendering' | 'props' | 'interaction' | 'state' | 'error' | 'edge-case',
      line?: number,
      hasMocks?: boolean,
      estimatedCoverage?: string[]       // Code paths covered
    }>,
    
    // Coverage assessment
    coverage?: {
      statements?: number,               // 0-100
      branches?: number,                 // 0-100
      functions?: number,                // 0-100
      lines?: number,                    // 0-100
      gapAnalysis?: {
        uncoveredLines?: number[],
        uncoveredBranches?: string[],
        uncoveredFunctions?: string[]
      }
    },
    
    // Quality metrics
    quality: {
      score: number,                     // 0-100
      naming: number,                    // Quality of test names
      organization: number,              // Test structure and organization
      documentation: number,             // Comments and descriptions
      isolation: number                  // Test independence
    },
    
    // Issues found
    issues?: Array<{
      type: 'naming' | 'structure' | 'coverage' | 'pattern' | 'documentation' | 'mock',
      severity: 'error' | 'warning' | 'info',
      message: string,
      line?: number,
      suggestion?: string
    }>,
    
    // Anti-patterns detected
    antiPatterns?: Array<{
      pattern: string,
      description: string,
      line?: number,
      suggestion?: string
    }>,
    
    // Summary
    summary: string,
    strengths: string[],
    improvements: string[]
  },
  
  // Coverage gaps
  gaps?: Array<{
    type: 'scenario' | 'edge-case' | 'error-handling',
    description: string,
    recommendation: string
  }>,
  
  error?: string
}
```

## Standards Enforced

### Test Structure
- **Describe Blocks**: One per component/function
- **Test Cases**: Clear, descriptive names
- **Setup/Teardown**: beforeEach/beforeAll for common setup
- **Mocks**: Clear mock definitions, properly reset
- **Assertions**: One primary assertion per test (may have supporting ones)

### Test Naming
- **Behavior-Focused**: Describe what the code does, not how
- **Clarity**: Names should be readable without looking at code
- **Format**: Should read like a specification
- **Examples**:
  - ✅ "renders user name when provided"
  - ✅ "calls onEdit callback with user ID when edit button clicked"
  - ❌ "sets state"
  - ❌ "tests handleClick"

## Next Steps

- [ ] Implement test file parsing for each framework
- [ ] Add coverage report integration
- [ ] Implement anti-pattern detection
- [ ] Add code path analysis
- [ ] Create coverage gap recommendations
- [ ] Implement test naming quality scoring
- [ ] Add framework-specific analysis engines
- [ ] Integrate with CI/CD coverage reports
- [ ] Add historical coverage tracking
- [ ] Implement test effectiveness scoring
