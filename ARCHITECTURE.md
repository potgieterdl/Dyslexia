# Investment Analyzer - Technical Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│                    (React / Next.js UI)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐   │
│  │   Pages    │  │ API Routes │  │  Server Components │   │
│  │  (UI/UX)   │  │ (Backend)  │  │   (SSR/Streaming)  │   │
│  └────────────┘  └────────────┘  └────────────────────┘   │
└──────────────┬───────────┬────────────────┬────────────────┘
               │           │                │
               ▼           ▼                ▼
┌──────────────────┐  ┌──────────────┐  ┌─────────────────┐
│   Workflow       │  │  Database    │  │  External APIs  │
│  Orchestrator    │  │  (SQLite)    │  │                 │
│                  │  │              │  │  • Claude AI    │
│  • Step Manager  │  │  • Companies │  │  • Alpha Vantage│
│  • Scoring       │  │  • Evaluations│  │  • NewsAPI     │
│  • Aggregation   │  │  • Steps     │  │  • IEX Cloud   │
└──────────────────┘  └──────────────┘  └─────────────────┘
```

## Core Components

### 1. Frontend Layer (Next.js + React)

**Responsibilities**:
- Render UI components
- Handle user interactions
- Display real-time updates
- Manage client-side state

**Key Technologies**:
- Next.js 16 (App Router)
- React 19 (Server Components)
- TypeScript (strict mode)
- Tailwind CSS v4

**Component Structure**:
```
components/
├── ui/              # Atomic components (buttons, inputs, cards)
├── charts/          # Data visualization components
├── analysis/        # Analysis-specific components
└── features/        # Composite feature components
```

---

### 2. API Layer (Next.js API Routes)

**Responsibilities**:
- Handle HTTP requests
- Validate inputs
- Orchestrate business logic
- Return JSON responses

**Endpoints**:
```
POST   /api/analysis              # Start new analysis
GET    /api/evaluations           # List all evaluations
GET    /api/evaluations/[id]      # Get specific evaluation
POST   /api/evaluations/[id]/update # Refresh evaluation
GET    /api/companies/search      # Search companies (planned)
GET    /api/market-data/[ticker]  # Get market data (planned)
```

**Request Flow**:
```
Request → Validation → Business Logic → Database → Response
```

---

### 3. Workflow Engine

**Purpose**: Execute multi-step analysis workflows

**Architecture**:
```typescript
WorkflowOrchestrator
├── WorkflowStep[] (registered steps)
├── execute(context)
│   ├── For each step:
│   │   ├── Check if can execute
│   │   ├── Create DB record
│   │   ├── Execute step logic
│   │   ├── Store results
│   │   └── Handle errors
│   └── Calculate overall rating
└── Aggregate scores → Final recommendation
```

**Step Interface**:
```typescript
interface WorkflowStep {
  name: string;
  type: 'ai' | 'manual';
  source: string;
  order: number;
  execute(context: WorkflowContext): Promise<StepResult>;
  canExecute?(context: WorkflowContext): boolean;
}
```

**Extensibility**:
- New steps implement `WorkflowStep` interface
- Register in `getDefaultWorkflowSteps()`
- No changes to orchestrator needed

---

### 4. AI Integration Layer

**Purpose**: Interact with Claude API for analysis

**Architecture**:
```typescript
ClaudeAnalyzer
├── analyze(request: AnalysisRequest)
│   ├── Build prompt (based on analysis type)
│   ├── Call Claude API
│   ├── Parse response (JSON extraction)
│   └── Return structured result
└── Prompt templates for each analysis type
```

**Prompt Strategy**:
- Structured prompts per analysis type
- Request JSON-formatted responses
- Include context from previous steps
- Fallback to text parsing if JSON fails

**Cost Optimization**:
- Cache responses (planned)
- Optimize prompt length
- Use appropriate model (Haiku for simple tasks)
- Batch similar requests (planned)

---

### 5. Database Layer (SQLite)

**Purpose**: Persist all analysis data

**Schema**:
```sql
companies
├── id (PK)
├── name
├── ticker
├── sector
└── created_at

evaluations
├── id (PK)
├── company_id (FK)
├── overall_rating (buy/hold/sell)
├── overall_score (-100 to 100)
├── status (pending/in_progress/completed/failed)
├── created_at
├── updated_at
└── completed_at

analysis_steps
├── id (PK)
├── evaluation_id (FK)
├── step_name
├── step_type (ai/manual)
├── source
├── status
├── score
├── sentiment (positive/negative/neutral)
├── raw_data (JSON)
├── summary
├── key_points (JSON array)
├── error_message
├── created_at
└── completed_at
```

**Indexes**:
```sql
idx_evaluations_company (company_id)
idx_evaluations_status (status)
idx_analysis_steps_evaluation (evaluation_id)
idx_companies_ticker (ticker) -- planned
```

**Operations**:
- CRUD operations in `lib/db/index.ts`
- Type-safe interfaces in `lib/db/schema.ts`
- Migrations in `scripts/migrate.js` (planned)

---

### 6. Data Integration Layer (Planned)

**Purpose**: Fetch real financial data from multiple sources

**Architecture**:
```typescript
interface DataProvider {
  getQuote(ticker: string): Promise<Quote>;
  getFinancials(ticker: string): Promise<Financials>;
  getNews(ticker: string): Promise<News[]>;
}

class AlphaVantageProvider implements DataProvider { }
class YahooFinanceProvider implements DataProvider { }
class IEXCloudProvider implements DataProvider { }

// Provider with fallback
DataService
├── Primary: AlphaVantageProvider
├── Fallback: YahooFinanceProvider
└── Cache: 5-minute TTL
```

**Data Normalization**:
- Different APIs return different formats
- Normalize to common interface
- Validate data quality
- Handle missing data gracefully

---

### 7. Analysis Engine (Planned)

**Purpose**: Calculate financial metrics and valuations

**Modules**:
```typescript
lib/analysis/
├── ratios.ts           # Financial ratios
│   ├── Liquidity ratios
│   ├── Profitability ratios
│   ├── Leverage ratios
│   └── Valuation ratios
├── valuation.ts        # Valuation models
│   ├── DCF (Discounted Cash Flow)
│   ├── DDM (Dividend Discount Model)
│   └── Comparables
├── technical.ts        # Technical indicators
│   ├── Moving averages
│   ├── RSI, MACD
│   └── Bollinger Bands
└── risk.ts             # Risk metrics
    ├── Beta, Alpha
    ├── Sharpe ratio
    └── VaR (Value at Risk)
```

---

## Data Flow

### Typical Analysis Flow

```
1. User submits company name
   ↓
2. API: Create company & evaluation records
   ↓
3. API: Start workflow (non-blocking)
   ↓
4. Workflow: For each step:
   ├─→ Fetch financial data (when available)
   ├─→ Build context
   ├─→ Call Claude AI
   ├─→ Parse response
   ├─→ Calculate score
   └─→ Save to database
   ↓
5. Workflow: Aggregate all scores
   ↓
6. Workflow: Generate buy/hold/sell rating
   ↓
7. Frontend: Poll for updates (currently)
   ↓
8. Frontend: Display results
```

### Real-time Updates (Current)

```
Frontend                    Backend
   │                          │
   ├─ Start analysis ────────→│
   │←──── Evaluation ID ──────┤
   │                          │
   ├─ Poll (every 2s) ───────→│
   │←──── Status + Steps ─────┤
   │                          │
   ├─ Poll ─────────────────→ │
   │←──── Updated data ────── │
   │                          │
   └─ Stop when complete      │
```

### Real-time Updates (Planned - SSE)

```
Frontend                    Backend
   │                          │
   ├─ Start analysis ────────→│
   │←──── Event Stream ───────┤
   │                          │
   │←── event: step_started ──┤
   │←── event: step_completed ┤
   │←── event: step_started ──┤
   │←── event: step_completed ┤
   │←── event: analysis_done ─┤
   │                          │
   └─ Close stream            │
```

---

## State Management

### Client State
- Component state: `useState`
- Shared state: React Context
- Server state: React Query (planned)

### Server State
- Database: SQLite
- Cache: In-memory → Redis (planned)
- Sessions: JWT (planned)

---

## Security Architecture

### Input Validation
```typescript
// Using Zod schemas
const CompanySchema = z.object({
  name: z.string().min(1).max(200),
  ticker: z.string().min(1).max(10).toUpperCase().optional(),
});
```

### SQL Injection Prevention
- Parameterized queries (all queries)
- No string concatenation
- Input sanitization

### XSS Prevention
- React auto-escapes by default
- Sanitize user HTML (DOMPurify planned)
- Content Security Policy headers

### Rate Limiting (Planned)
```typescript
// Per IP
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

### API Key Security
- Environment variables only
- Never commit to git
- Rotate regularly
- Use separate keys per environment

---

## Performance Optimization

### Current
- Database indexes on foreign keys
- Minimal bundle size
- SSR for initial load

### Planned
- Redis caching (5-minute TTL)
- CDN for static assets
- Image optimization
- Code splitting
- Lazy loading components
- Database query optimization
- API response compression

---

## Error Handling

### Strategy
```typescript
try {
  // Operation
} catch (error) {
  // 1. Log error with context
  logger.error('Operation failed', { error, context });

  // 2. Store in database if needed
  updateAnalysisStep(id, {
    status: 'failed',
    error_message: error.message
  });

  // 3. Return user-friendly message
  return {
    success: false,
    error: 'Failed to analyze company. Please try again.'
  };
}
```

### Error Types
- **Validation Errors**: 400 Bad Request
- **Not Found**: 404 Not Found
- **Server Errors**: 500 Internal Server Error
- **API Errors**: Log and retry with backoff
- **Database Errors**: Log and alert

---

## Scalability Considerations

### Current Limitations
- SQLite: Single file, no horizontal scaling
- In-process execution: Limited concurrency
- No load balancing
- No caching layer

### Migration Path
1. **Phase 1** (Current - 100 users)
   - SQLite is sufficient
   - Single server deployment

2. **Phase 2** (100-1000 users)
   - Add Redis caching
   - Background job queue (Bull)
   - Migrate to PostgreSQL

3. **Phase 3** (1000+ users)
   - Horizontal scaling
   - Database read replicas
   - CDN for assets
   - Kubernetes orchestration

---

## Development Environment

### Local Setup
```bash
# Dependencies
Node.js 18+
npm 9+

# Installation
npm install

# Environment
cp .env.example .env
# Add ANTHROPIC_API_KEY

# Run
npm run dev

# Build
npm run build

# Test
npm test
```

### Database Development
```bash
# Create migration
node scripts/create-migration.js add_users_table

# Run migrations
npm run db:migrate

# Seed data
npm run db:seed
```

---

## Deployment Architecture (Planned)

### Development
```
GitHub → GitHub Actions → Vercel Preview
```

### Production
```
GitHub main branch
  ↓
GitHub Actions
  ├─ Run tests
  ├─ Build Docker image
  ├─ Push to registry
  └─ Deploy to production
      ├─ Web servers (2+ instances)
      ├─ PostgreSQL (managed)
      ├─ Redis (managed)
      └─ Load balancer
```

---

## Monitoring & Observability (Planned)

### Metrics
- Request rate, latency, error rate
- Database query performance
- Claude API usage and costs
- Cache hit rate
- Analysis completion rate

### Logging
- Structured logging (JSON)
- Log levels: debug, info, warn, error
- Correlation IDs for request tracing
- Log aggregation (ELK or Loki)

### Alerting
- Error rate > 1%
- API latency > 2s
- Database connections > 80%
- Disk space < 10%
- Cost anomalies

---

## Testing Strategy

### Unit Tests
- Utility functions
- Financial calculations
- Data transformations
- 80%+ coverage goal

### Integration Tests
- API endpoints
- Database operations
- External API calls (mocked)

### E2E Tests
- Critical user flows
- Analysis creation
- Results viewing
- Error scenarios

### Testing Tools
- Vitest for unit tests
- Playwright for E2E tests
- MSW for API mocking

---

## Key Design Decisions

### Why Next.js?
- Full-stack framework (frontend + API)
- Built-in SSR/SSG
- Great developer experience
- Vercel deployment
- Large ecosystem

### Why SQLite?
- Zero configuration
- Perfect for MVP
- Fast for reads
- Easy backups (single file)
- Migration path to PostgreSQL clear

### Why Claude AI?
- Best-in-class analysis quality
- JSON mode for structured outputs
- Long context window
- Good pricing
- Great for financial analysis

### Why TypeScript?
- Type safety prevents bugs
- Better IDE experience
- Self-documenting code
- Required for scale

---

## Future Architecture Enhancements

### Near-term (Next 3 months)
- [ ] Redis caching
- [ ] Background job queue
- [ ] Real financial data integration
- [ ] Server-Sent Events for real-time
- [ ] PostgreSQL migration

### Medium-term (3-6 months)
- [ ] Microservices for analysis
- [ ] GraphQL API
- [ ] Real-time collaboration
- [ ] Mobile app (React Native)
- [ ] Kubernetes deployment

### Long-term (6-12 months)
- [ ] Multi-region deployment
- [ ] AI model fine-tuning
- [ ] Streaming data processing
- [ ] Advanced caching (distributed)
- [ ] Machine learning predictions

---

## Technical Debt

### Known Issues
1. No error boundaries in UI
2. Polling instead of SSE/WebSocket
3. No caching layer
4. Limited test coverage
5. No input validation schemas
6. SQLite will limit scale

### Mitigation Plan
- Prioritized in TASKS.md
- Address highest-risk items first
- Allocate 20% sprint time to debt
- Track in GitHub issues

---

## Dependencies

### Critical Dependencies
- `next`: Web framework
- `react`: UI library
- `@anthropic-ai/sdk`: Claude AI
- `better-sqlite3`: Database
- `typescript`: Type safety
- `tailwindcss`: Styling

### Development Dependencies
- `@types/*`: TypeScript types
- `eslint`: Linting
- `prettier`: Code formatting
- Testing tools (planned)

### Security
- Regular `npm audit`
- Dependabot alerts enabled
- Review major version updates
- Pin versions in production

---

This architecture is designed to:
1. **Start simple** (SQLite, single server)
2. **Scale gradually** (add caching, jobs, PostgreSQL)
3. **Remain flexible** (extensible workflows, pluggable providers)
4. **Be maintainable** (clear separation of concerns, TypeScript)

See [TASKS.md](./TASKS.md) for implementation priorities.
