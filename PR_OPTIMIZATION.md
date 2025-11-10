# PR Optimization Checklist

This document outlines what's missing from the current PR and what should be added before merging to ensure production readiness.

## 🔴 Critical - Must Have Before Merge

### 1. Code Quality & Linting
- [ ] **ESLint Configuration** - Missing
  ```bash
  npm install -D eslint eslint-config-next @typescript-eslint/parser @typescript-eslint/eslint-plugin
  ```
  - Create `.eslintrc.json`
  - Configure rules for TypeScript + React
  - Add lint script: `"lint": "next lint"`
  - Fix all linting errors

- [ ] **Prettier Configuration** - Missing
  ```bash
  npm install -D prettier eslint-config-prettier
  ```
  - Create `.prettierrc`
  - Add format scripts: `"format": "prettier --write ."`
  - Format all existing code

- [ ] **Git Hooks (Husky)** - Recommended
  ```bash
  npm install -D husky lint-staged
  ```
  - Pre-commit: Run lint + format
  - Pre-push: Run type check
  - Prevents bad code from being committed

### 2. Environment Setup
- [ ] **Clear Setup Instructions in README**
  - Step-by-step environment setup
  - How to get Anthropic API key
  - Troubleshooting section
  - Common errors and solutions

- [ ] **Database Initialization Script**
  - Create `scripts/init-db.js`
  - Auto-create tables on first run
  - Add seed data for development
  - Handle migrations gracefully

- [ ] **Environment Validation**
  - Create `lib/config/validate-env.ts`
  - Check required env vars on startup
  - Provide helpful error messages
  - Example:
    ```typescript
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Missing ANTHROPIC_API_KEY in .env file');
    }
    ```

### 3. Basic Error Handling
- [ ] **API Route Error Handling**
  - Wrap all API routes in try-catch
  - Return consistent error format:
    ```json
    {
      "error": "User-friendly message",
      "code": "ERROR_CODE",
      "details": {} // Only in development
    }
    ```
  - Log errors to console (structured)
  - HTTP status codes (400, 404, 500)

- [ ] **React Error Boundary**
  ```bash
  npm install react-error-boundary
  ```
  - Create `components/ErrorBoundary.tsx`
  - Wrap entire app in `app/layout.tsx`
  - Show friendly error UI
  - Log errors to console

- [ ] **Database Error Handling**
  - Catch SQLite errors
  - Handle locked database
  - Handle disk space issues
  - Graceful degradation

### 4. Basic Input Validation
- [ ] **Install Zod**
  ```bash
  npm install zod
  ```

- [ ] **Create Validation Schemas**
  - Create `lib/validation/schemas.ts`
  - Company name: 1-200 chars, no special chars
  - Ticker: 1-10 chars, uppercase, alphanumeric
  - Validate all API inputs

- [ ] **Client-Side Validation**
  - Add validation to `AnalysisForm.tsx`
  - Show inline error messages
  - Disable submit if invalid
  - Use Zod schema

- [ ] **Server-Side Validation**
  - Validate in API routes (never trust client)
  - Return 400 with validation errors
  - Sanitize all inputs (XSS prevention)

### 5. Loading States & UX
- [ ] **Loading Indicators**
  - Create `components/ui/spinner.tsx`
  - Add to all async operations
  - Show during analysis
  - Show during page transitions

- [ ] **Skeleton Screens**
  - Create skeleton for evaluation results
  - Create skeleton for evaluations list
  - Better UX than spinner alone

- [ ] **Empty States**
  - No evaluations yet → helpful message + CTA
  - No results yet → clear guidance
  - Error states → actionable next steps

- [ ] **Progress Feedback**
  - Show which step is running
  - Show steps completed vs total
  - Estimated time remaining (nice to have)
  - Prevent user from leaving during analysis

### 6. TypeScript Improvements
- [ ] **Stricter TypeScript Config**
  - Enable: `"noImplicitAny": true`
  - Enable: `"strictNullChecks": true`
  - Enable: `"noUnusedLocals": true`
  - Enable: `"noUnusedParameters": true`
  - Fix all new errors

- [ ] **API Response Types**
  - Create `types/api.ts`
  - Type all API responses
  - Type all API requests
  - Use throughout app

- [ ] **Component Props Validation**
  - Ensure all components have typed props
  - No `any` types
  - Use TypeScript generics where appropriate

### 7. Documentation
- [ ] **Enhanced README**
  - Prerequisites section
  - Installation steps (numbered)
  - Configuration guide
  - Running the app
  - Building for production
  - Troubleshooting section
  - FAQ section
  - Screenshots/demo GIF

- [ ] **API Documentation**
  - Document all endpoints
  - Request/response examples
  - Error codes
  - Rate limits (when implemented)

- [ ] **Contributing Guide**
  - Create `CONTRIBUTING.md`
  - Code of conduct
  - How to contribute
  - Coding standards
  - PR process

### 8. Security
- [ ] **Environment Variables**
  - Ensure `.env` is in `.gitignore` ✅ (already done)
  - Never expose API keys
  - Use `NEXT_PUBLIC_` prefix only for client vars
  - Rotate keys regularly

- [ ] **SQL Injection Prevention**
  - Review all database queries ✅ (using parameterized queries)
  - Never concatenate user input
  - Use prepared statements

- [ ] **XSS Prevention**
  - React auto-escapes ✅ (default)
  - Sanitize any HTML input (DOMPurify if needed)
  - Content Security Policy headers (next step)

- [ ] **Rate Limiting (Basic)**
  - Document need in TASKS.md
  - Plan implementation
  - Prevent API abuse

---

## 🟠 High Priority - Should Have Before Merge

### 9. Testing Foundation
- [ ] **Install Testing Tools**
  ```bash
  npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
  ```

- [ ] **Basic Smoke Tests**
  - Test: Database initializes
  - Test: API routes return 200
  - Test: Pages render without crashing
  - Add script: `"test": "vitest"`

- [ ] **Utility Function Tests**
  - Test: `formatDate()` in `lib/utils.ts`
  - Test: `formatCurrency()` in `lib/utils.ts`
  - Test: `cn()` className merging

### 10. Database Improvements
- [ ] **Migration System**
  - Create `scripts/migrate.js` (currently empty)
  - Track schema version
  - Up/down migrations
  - Run automatically on start

- [ ] **Database Indexes** ✅ (basic ones exist)
  - Add index on `companies.ticker`
  - Full-text search index (later)
  - Query performance testing

- [ ] **Seed Data Script**
  - Create `scripts/seed.js`
  - Sample companies
  - Sample evaluations
  - For development/testing

### 11. Package.json Improvements
- [ ] **Add More Scripts**
  ```json
  {
    "scripts": {
      "dev": "next dev",
      "build": "next build",
      "start": "next start",
      "lint": "next lint",
      "format": "prettier --write .",
      "format:check": "prettier --check .",
      "type-check": "tsc --noEmit",
      "test": "vitest",
      "test:ui": "vitest --ui",
      "db:init": "node scripts/init-db.js",
      "db:seed": "node scripts/seed.js",
      "db:migrate": "node scripts/migrate.js",
      "clean": "rm -rf .next node_modules"
    }
  }
  ```

- [ ] **Add Keywords**
  - "investment"
  - "analysis"
  - "ai"
  - "claude"
  - "financial"
  - "stock"

- [ ] **Add Author & License**
  - Fill in author field
  - Confirm ISC license
  - Create `LICENSE` file

### 12. GitHub Repository Setup
- [ ] **LICENSE File**
  - Create `LICENSE` file with ISC or MIT
  - Include copyright year and holder

- [ ] **CONTRIBUTING.md**
  - How to contribute
  - Code style
  - PR process
  - Issue guidelines

- [ ] **Issue Templates**
  - `.github/ISSUE_TEMPLATE/bug_report.md`
  - `.github/ISSUE_TEMPLATE/feature_request.md`

- [ ] **PR Template**
  - `.github/PULL_REQUEST_TEMPLATE.md`
  - Checklist for contributors

### 13. CI/CD (Basic)
- [ ] **GitHub Actions Workflow**
  - Create `.github/workflows/ci.yml`
  - Run on: push, pull_request
  - Jobs:
    - Lint
    - Type check
    - Build test
    - Run tests (when added)

Example workflow:
```yaml
name: CI

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run build
```

---

## 🟡 Medium Priority - Nice to Have

### 14. Performance Optimizations
- [ ] **Image Optimization**
  - Use Next.js `<Image>` component
  - Optimize logo/icons
  - WebP format

- [ ] **Code Splitting**
  - Dynamic imports for heavy components
  - Lazy load charts
  - Route-based splitting

- [ ] **Bundle Analysis**
  - Add: `npm install -D @next/bundle-analyzer`
  - Check bundle size
  - Optimize large dependencies

### 15. Accessibility Basics
- [ ] **ARIA Labels**
  - Add to icon buttons
  - Add to form inputs
  - Add to interactive elements

- [ ] **Keyboard Navigation**
  - Tab through all interactive elements
  - Focus indicators visible
  - Escape closes modals

- [ ] **Semantic HTML**
  - Use proper heading hierarchy
  - Use `<nav>`, `<main>`, `<section>`
  - Alt text for images

### 16. SEO Improvements
- [ ] **Meta Tags**
  - Open Graph tags
  - Twitter cards
  - Canonical URLs

- [ ] **robots.txt**
  - Allow/disallow crawlers
  - Sitemap reference

- [ ] **sitemap.xml**
  - List all public pages
  - Update on build

### 17. Monitoring Setup (Prep)
- [ ] **Error Tracking Prep**
  - Document Sentry integration plan
  - Add TODO in TASKS.md
  - Plan error boundaries

- [ ] **Analytics Prep**
  - Document analytics plan
  - Privacy considerations
  - Cookie consent needs

---

## 🟢 Low Priority - Future PRs

### 18. Advanced Features (Post-MVP)
- [ ] Real financial data integration
- [ ] Advanced calculations (DCF, etc.)
- [ ] Charts and visualizations
- [ ] User authentication
- [ ] Portfolio management
- [ ] Export functionality

### 19. Infrastructure (Later)
- [ ] Docker setup
- [ ] Docker Compose
- [ ] Deployment docs
- [ ] Production monitoring
- [ ] Backup strategy

---

## Suggested Implementation Order

### Phase 1: Code Quality (2-3 hours)
1. Add ESLint config
2. Add Prettier config
3. Format all code
4. Fix linting errors
5. Add git hooks (Husky)

### Phase 2: Error Handling (2-3 hours)
6. Add error boundary component
7. Wrap all API routes in try-catch
8. Add database error handling
9. Create consistent error responses

### Phase 3: Validation (1-2 hours)
10. Install Zod
11. Create validation schemas
12. Add client-side validation
13. Add server-side validation

### Phase 4: UX Polish (2-3 hours)
14. Add loading spinners
15. Create skeleton screens
16. Add empty states
17. Improve progress indicators

### Phase 5: Environment & Setup (1-2 hours)
18. Create database init script
19. Add environment validation
20. Enhance README with setup guide
21. Add troubleshooting section

### Phase 6: Testing (2-3 hours)
22. Install testing tools
23. Write basic smoke tests
24. Test utility functions
25. Add test script to CI

### Phase 7: CI/CD (1 hour)
26. Create GitHub Actions workflow
27. Add lint/type-check/build
28. Test workflow

### Phase 8: Documentation (1-2 hours)
29. Create LICENSE file
30. Create CONTRIBUTING.md
31. Add issue templates
32. Add PR template

**Total Estimated Time: 12-19 hours**

---

## Quick Wins (Can Do Now - 30 min)

These can be done immediately with minimal effort:

1. **Add ESLint config** - 5 min
2. **Add Prettier config** - 5 min
3. **Format all code** - 2 min
4. **Create LICENSE file** - 2 min
5. **Add more npm scripts** - 5 min
6. **Add keywords to package.json** - 2 min
7. **Basic README improvements** - 10 min

---

## What's Already Good ✅

Don't need to fix these:
- [x] TypeScript strict mode enabled
- [x] Proper project structure
- [x] Comprehensive documentation (OVERVIEW, ARCHITECTURE, TASKS, etc.)
- [x] Parameterized database queries (SQL injection safe)
- [x] Environment variables properly ignored
- [x] Next.js best practices followed
- [x] Component organization is clean
- [x] Database schema is well-designed
- [x] API routes follow REST conventions
- [x] Tailwind CSS properly configured
- [x] Basic gitignore in place

---

## Risk Assessment

### High Risk if Not Fixed
- No error handling → App crashes on errors
- No input validation → Security vulnerabilities
- No environment validation → Confusing errors
- No linting → Code quality degrades

### Medium Risk
- No tests → Regressions likely
- No CI/CD → Manual verification needed
- No database init → Setup friction
- No loading states → Poor UX

### Low Risk
- No advanced features → Expected for MVP
- No monitoring → Can add later
- No advanced security → Can layer in

---

## Recommendation

**Before Merging:**
1. Add code quality tools (ESLint, Prettier) - 30 min
2. Add basic error handling - 2 hours
3. Add input validation - 1 hour
4. Add loading states - 1 hour
5. Create database init script - 30 min
6. Enhance README - 30 min

**Total: ~5.5 hours to make PR production-ready**

**After Merging (Follow-up PRs):**
- Testing setup
- CI/CD pipeline
- Advanced features
- Real data integration
- Performance optimizations

This allows us to merge a solid foundation while acknowledging that some features are roadmap items, not blockers.
