# TypeScript Coder Agent

A **TypeScript React developer** who specializes in creating well-tested, readable React components with comprehensive test coverage. Automatically detects and uses **Bun** package manager when appropriate, with npm as fallback.

## Philosophy

- **Testing First**: Every component has a corresponding test file with ≥80% coverage
- **Readability Over Performance**: Clear, maintainable code is prioritized over micro-optimizations
- **Self-Documenting Code**: Descriptive names and well-structured logic that explain intent
- **Bun-Native**: Prefers Bun for faster builds and tests when available

## Purpose

- Interpret React development requests and generate multi-step plans
- Orchestrate information-gathering and action skills
- Detect and use appropriate package manager (Bun or npm)
- Generate React components with integrated test suites
- Review code for readability and testability
- Manage refactoring workflows while maintaining test coverage

## Package Manager Support

The agent automatically detects which package manager to use:

### Bun Detection
- Checks for `bun.lockb` or `bunfig.toml` in project root
- Uses Bun commands if detected:
  - Install: `bun install`
  - Run: `bun run <script>`
  - Test: `bun run test`
  - Build: `bun run build`

### NPM Fallback
- Default when Bun is not detected
- Uses standard npm commands:
  - Install: `npm install`
  - Run: `npm run <script>`
  - Test: `npm run test`
  - Build: `npm run build`

### Explicit Configuration
```typescript
// Use Bun explicitly
agent.setPackageManager('bun');

// Use npm explicitly
agent.setPackageManager('npm');

// Get current configuration
const pmConfig = agent.getPackageManager();
```

## Capabilities

### Component Generation
- Creates TypeScript React components with clear structure
- Generates Jest + React Testing Library test suites
- Adds comprehensive JSDoc documentation
- Enforces naming conventions and file organization
- Configures build scripts for chosen package manager

### Code Review
- Analyzes code for readability issues
- Validates test coverage and quality
- Identifies non-obvious logic that needs comments
- Detects functions exceeding 50-line limit

### Test Validation
- Checks for describe blocks and test cases
- Identifies test coverage gaps
- Validates test structure (beforeEach, afterEach, etc.)
- Provides coverage estimates

### Refactoring
- Maintains test coverage during refactoring
- Improves variable and function names
- Extracts complex logic into smaller functions
- Adds explanatory comments

### Package Manager Integration
- Detects project's package manager preference
- Generates package.json scripts for both Bun and npm
- Includes package manager configuration in workflow plans
- Passes package manager commands to skills for implementation

## Implementation Files

- **DeveloperAgent.ts** - Main agent orchestration logic with Bun detection
- **DeveloperAgent.test.ts** - Comprehensive test suite (70+ tests) including package manager detection
- **SkillInterface.ts** - TypeScript contract for skill implementation
- **agent-config.json** - Configuration with React and Bun specialization
- **../../../rules/component-creation-rules.md** - Development rules and standards

## Usage Example

```typescript
import { DeveloperAgent } from './DeveloperAgent';

const agent = new DeveloperAgent(skillsMap);

// Agent auto-detects Bun or npm
let plan = await agent.planDevelopmentWorkflow({
  type: 'component',
  description: 'Create a user profile card component',
  componentName: 'UserProfileCard',
  requirements: [
    'Display user name, avatar, and email',
    'Show user stats',
    'Handle edit profile click',
  ],
});

console.log(`Using package manager: ${plan.packageManager.type}`);
console.log(`Install command: ${plan.packageManager.installCommand}`);
console.log(`Test command: ${plan.packageManager.testCommand}`);

// Execute the workflow
const result = await agent.executeDevelopmentWorkflow(
  { type: 'component', ... },
  plan
);

console.log(`Package manager used: ${result.packageManager}`); // 'bun' or 'npm'
```

## Workflow Steps

The agent follows a structured React development workflow:

1. **Detect Environment** - Identify React framework and package manager (Bun/npm)
2. **Analyze Requirements** - Use information-skill to clarify and document requirements
3. **Design Structure** - Plan component architecture with readability as priority
4. **Implement Component** - Use action-skill to generate TypeScript React component
5. **Create Tests** - Use action-skill to generate comprehensive test suite
6. **Add Documentation** - Add JSDoc and inline comments for complex logic

## Integration with Skills

The agent coordinates two core skills with package manager context:

- **information-skill**: Used for requirement analysis, code review, and planning
- **action-skill**: Used for component generation, test creation, receives package manager commands

## React Framework Features

- **JSX/TSX Support**: Generates TypeScript React components
- **Hooks Support**: Creates functional components using React hooks
- **Testing**: Jest + React Testing Library integration
- **Type Safety**: Full TypeScript typing for all components
- **Accessibility**: Enforces ARIA labels and semantic HTML in generated components

## Rules and Standards

See `../../../rules/component-creation-rules.md` for:
- Component creation rules and naming conventions
- Testing requirements and coverage goals
- Readability standards and file organization
- Code review checklist
- Examples of compliant components

## Running Tests

```bash
# Run all developer agent tests
npm test -- DeveloperAgent.test.ts

# Or with Bun
bun test DeveloperAgent.test.ts
```

Tests verify:
- Correct workflow planning for different request types
- Complexity estimation based on requirements
- Code review accuracy (identifying readability issues)
- Test coverage validation
- **Package manager detection and configuration** (70+ new tests)
- Bun vs npm command generation

## Next Steps for Extension

- [ ] Implement actual code generation using TypeScript compiler API
- [ ] Add support for Next.js with App Router/Pages Router detection
- [ ] Integrate with ESLint and Prettier for code formatting
- [ ] Add TypeScript compiler integration for type checking
- [ ] Create skill plugins for component libraries (Material-UI, Chakra UI, Headless UI)
- [ ] Add performance profiling integration (React DevTools, Lighthouse)
- [ ] Integrate with CI/CD pipeline for automated code quality checks
- [ ] Add Storybook integration
- [ ] Support for monorepo detection (Bun workspaces, npm workspaces)
