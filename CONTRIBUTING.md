# Contributing to Investment Analyzer

Thank you for considering contributing to Investment Analyzer! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and constructive. We're all here to build something great together.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](../../issues)
2. If not, create a new issue with:
   - Clear title describing the bug
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots if applicable
   - Environment (OS, Node version, browser)

### Suggesting Features

1. Check if the feature has already been requested in [Issues](../../issues)
2. If not, create a new issue with:
   - Clear title describing the feature
   - Use case and motivation
   - Proposed implementation (if you have ideas)
   - Any alternatives considered

### Submitting Changes

#### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Git
- Anthropic API key for testing

#### Development Workflow

1. **Fork & Clone**
   ```bash
   git fork https://github.com/potgieterdl/Dyslexia
   git clone https://github.com/YOUR_USERNAME/Dyslexia
   cd Dyslexia
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   ```bash
   cp .env.example .env
   # Add your ANTHROPIC_API_KEY to .env
   ```

4. **Initialize Database**
   ```bash
   npm run db:init
   ```

5. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

6. **Make Your Changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

7. **Test Your Changes**
   ```bash
   npm run dev        # Test locally
   npm run lint       # Check for linting errors
   npm run type-check # Check TypeScript types
   npm run format     # Format code
   npm run build      # Ensure it builds
   ```

8. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

   **Commit Message Format:**
   ```
   <type>: <description>

   [optional body]

   [optional footer]
   ```

   **Types:**
   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation changes
   - `style`: Code style changes (formatting, etc.)
   - `refactor`: Code refactoring
   - `test`: Adding or updating tests
   - `chore`: Maintenance tasks
   - `perf`: Performance improvements

   **Examples:**
   ```
   feat: add DCF valuation model
   fix: resolve database connection leak
   docs: update README with setup instructions
   refactor: extract analysis logic into separate service
   ```

9. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

10. **Create Pull Request**
    - Go to the original repository
    - Click "New Pull Request"
    - Select your fork and branch
    - Fill in the PR template
    - Link any related issues

#### Pull Request Guidelines

**Before Submitting:**
- [ ] Code follows project style guidelines
- [ ] All tests pass (when tests exist)
- [ ] No linting errors
- [ ] TypeScript compiles without errors
- [ ] Code is formatted (Prettier)
- [ ] Documentation updated if needed
- [ ] Commit messages follow convention

**PR Description Should Include:**
- Summary of changes
- Motivation and context
- Related issues (e.g., "Closes #123")
- Screenshots (for UI changes)
- Breaking changes (if any)
- How to test the changes

**Example PR Description:**
```markdown
## Summary
Adds DCF valuation model to calculate intrinsic value of companies.

## Motivation
Users need to understand if a stock is undervalued or overvalued based on cash flow projections.

## Changes
- Created `lib/analysis/dcf.ts` with DCF calculation logic
- Added UI component to display valuation results
- Updated workflow to include valuation step

## Related Issues
Closes #45

## Testing
1. Run analysis on any company
2. Check "Valuation" section in results
3. Verify DCF calculation matches manual calculation

## Screenshots
[Add screenshot of DCF results]
```

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Define types for all function parameters and return values
- Avoid `any` type (use `unknown` if needed)
- Use interfaces for object shapes
- Use type unions for variants

**Good:**
```typescript
interface AnalysisResult {
  score: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  summary: string;
}

function analyzeCompany(name: string): Promise<AnalysisResult> {
  // ...
}
```

**Bad:**
```typescript
function analyzeCompany(name: any): any {
  // ...
}
```

### React Components

- Use functional components with hooks
- Extract complex logic into custom hooks
- Use TypeScript for props
- Keep components focused (single responsibility)
- Extract reusable logic

**Good:**
```typescript
interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function Button({ onClick, disabled, children }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
```

### File Naming

- React components: `PascalCase.tsx` (e.g., `AnalysisForm.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Types: `types.ts` or `schema.ts`
- Constants: `UPPER_SNAKE_CASE` or `camelCase`

### Code Organization

```
lib/
├── ai/           # AI/ML related code
├── db/           # Database operations
├── workflow/     # Workflow engine
├── analysis/     # Financial calculations
├── utils/        # Utility functions
└── types/        # Shared types

components/
├── ui/           # Base UI components
├── charts/       # Chart components
├── analysis/     # Analysis-specific
└── layout/       # Layout components
```

### Comments

- Use comments to explain "why", not "what"
- Document complex algorithms
- Add JSDoc for public APIs
- Keep comments up to date

**Good:**
```typescript
// Use exponential backoff to avoid overwhelming the API during high load
const delay = Math.pow(2, retryCount) * 1000;
```

**Bad:**
```typescript
// Set delay to 2 to the power of retryCount times 1000
const delay = Math.pow(2, retryCount) * 1000;
```

## Testing (When Tests Exist)

- Write tests for new features
- Update tests for changed features
- Aim for meaningful test coverage
- Test edge cases and error handling

```typescript
describe('calculateScore', () => {
  it('should return 0 for neutral sentiment', () => {
    const result = calculateScore('neutral');
    expect(result).toBe(0);
  });

  it('should throw error for invalid sentiment', () => {
    expect(() => calculateScore('invalid')).toThrow();
  });
});
```

## Documentation

- Update README.md if user-facing changes
- Update TASKS.md if completing tasks
- Update API documentation if API changes
- Add JSDoc comments for public functions
- Include code examples when helpful

## Review Process

1. **Automated Checks**: CI runs linting, type-checking, and build
2. **Code Review**: Maintainer reviews code quality and design
3. **Testing**: Manually test changes
4. **Feedback**: Address review comments
5. **Merge**: Once approved and all checks pass

## Getting Help

- Read the [OVERVIEW.md](./OVERVIEW.md) for project vision
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- Look at [TASKS.md](./TASKS.md) for current priorities
- Ask questions in issue comments
- Join discussions in GitHub Discussions

## Recognition

Contributors will be:
- Listed in release notes
- Mentioned in CHANGELOG
- Added to contributors list
- Given credit in commits

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! Every contribution, no matter how small, makes a difference.
