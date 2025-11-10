# Investment Analyzer

AI-powered investment verification tool that analyzes companies using Claude AI integration. Get comprehensive investment insights from multiple sources including financial statements, market sentiment, news analysis, and more.

## Features

- **Comprehensive Analysis**: Multi-step workflow analyzing companies from various angles
- **AI-Powered Insights**: Claude AI integration for intelligent analysis
- **Extensible Architecture**: Easy to add new analysis steps (AI-driven or self-implemented)
- **Real-time Progress**: Watch analysis progress in real-time
- **Historical Tracking**: Store and review past evaluations
- **Clear Scoring System**: Buy/Hold/Sell recommendations with detailed scoring

## Analysis Steps

The tool performs the following analyses:

1. **Financial Statements Analysis** - Balance sheet, income statement, cash flow
2. **Quarterly Financial Results** - Recent earnings and performance trends
3. **Market Sentiment Analysis** - Trading patterns and investor sentiment
4. **News & Media Coverage** - Recent news and developments
5. **Analyst Reports** - Professional analyst ratings and price targets
6. **Competitive Positioning** - Market share and competitive advantages

Each step generates:

- A score (-100 to 100)
- Sentiment (positive/negative/neutral)
- Summary and key points
- Overall buy/hold/sell recommendation

## Tech Stack

- **Framework**: Next.js 16 with TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **Database**: SQLite with better-sqlite3
- **AI**: Anthropic Claude API
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 20.9.0 or higher (required by Next.js 16)
- npm 9 or higher
- Anthropic API key ([Get one here](https://console.anthropic.com/))

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd Dyslexia
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=your_api_key_here
DATABASE_PATH=./data/investment-analyzer.db
```

4. Initialize the database:

```bash
npm run db:init
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Git Hooks (Automatic)

The project uses [Husky](https://typicode.github.io/husky/) to automatically:

- **Format code** with Prettier before every commit
- **Fix lint issues** with ESLint before every commit
- **Check types** with TypeScript before every push

This ensures code quality without manual intervention. Hooks are set up automatically when you run `npm install`.

## Usage

### Analyzing a Company

1. Enter the company name in the input field
2. Optionally add the ticker symbol (e.g., AAPL for Apple)
3. Click "Analyze Company"
4. Watch the real-time analysis progress
5. Review detailed results in the right panel

### Reviewing Past Evaluations

- Click on any past evaluation in the left sidebar
- Use the "Update" button to refresh analysis with current data

### Adding Custom Analysis Steps

The workflow system is designed to be extensible. You can add new steps by:

1. Creating a new class implementing the `WorkflowStep` interface:

```typescript
import { WorkflowStep, WorkflowContext, StepResult } from '@/lib/workflow/types';

export class CustomAnalysisStep implements WorkflowStep {
  name = 'custom_analysis';
  source = 'Custom Analysis Source';
  description = 'Your custom analysis description';
  order = 7;
  type: 'ai' | 'manual' = 'ai'; // or 'manual' for self-implemented

  async execute(context: WorkflowContext): Promise<StepResult> {
    // Your analysis logic here
    return {
      success: true,
      score: 50,
      sentiment: 'positive',
      summary: 'Analysis summary',
      keyPoints: ['Point 1', 'Point 2'],
    };
  }
}
```

2. Register the step in `lib/workflow/steps.ts`:

```typescript
export function getDefaultWorkflowSteps(): WorkflowStep[] {
  return [
    // ... existing steps
    new CustomAnalysisStep(),
  ];
}
```

## Project Structure

```
├── app/
│   ├── api/                 # API routes
│   │   ├── analysis/       # Start new analysis
│   │   └── evaluations/    # Get/update evaluations
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── AnalysisForm.tsx    # Company input form
│   ├── AnalysisResults.tsx # Results display
│   └── EvaluationsList.tsx # Past evaluations
├── lib/
│   ├── ai/
│   │   └── claude.ts       # Claude AI integration
│   ├── db/
│   │   ├── schema.ts       # Database schema
│   │   └── index.ts        # Database operations
│   ├── workflow/
│   │   ├── types.ts        # Workflow interfaces
│   │   ├── orchestrator.ts # Workflow execution
│   │   └── steps.ts        # Analysis steps
│   └── utils.ts            # Utility functions
└── data/                   # SQLite database (auto-created)
```

## Database Schema

The application uses SQLite with three main tables:

- **companies**: Stores company information
- **evaluations**: Stores analysis evaluations
- **analysis_steps**: Stores individual step results

## API Endpoints

- `POST /api/analysis` - Start new company analysis
- `GET /api/evaluations` - Get all evaluations
- `GET /api/evaluations/[id]` - Get specific evaluation with steps
- `POST /api/evaluations/[id]/update` - Update evaluation with fresh data

## Architecture Highlights

### Extensible Workflow System

The workflow system is built on a plugin-like architecture:

- **WorkflowStep Interface**: Defines the contract for analysis steps
- **WorkflowOrchestrator**: Manages step execution and aggregation
- **AI-driven Steps**: Use Claude AI for analysis
- **Manual Steps**: Implement custom logic (API calls, calculations, etc.)

### Real-time Updates

- Polling mechanism for live progress updates
- Database-backed state management
- Optimistic UI updates

### Scoring System

- Each step provides a score from -100 to 100
- Overall score is weighted average of all steps
- Rating thresholds:
  - Buy: score ≥ 30
  - Hold: -30 < score < 30
  - Sell: score ≤ -30

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Important Notes

- **Educational Use**: This tool is for educational and research purposes only
- **Not Financial Advice**: Do not use as sole basis for investment decisions
- **API Costs**: Claude API calls incur costs based on usage
- **Rate Limits**: Be mindful of API rate limits

## Future Enhancements

Potential additions:

- Real-time financial data API integration
- Advanced valuation models (DCF, DDM)
- Portfolio tracking
- Comparison tools
- Export to PDF/Excel
- Custom workflow templates
- User authentication
- Webhook notifications

## License

ISC

## Support

For issues or questions, please open an issue on GitHub.
