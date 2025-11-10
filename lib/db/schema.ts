export interface Company {
  id: number;
  name: string;
  ticker?: string;
  sector?: string;
  created_at: string;
}

export interface Evaluation {
  id: number;
  company_id: number;
  overall_rating: 'buy' | 'hold' | 'sell';
  overall_score: number; // -100 to 100
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  completed_at?: string;
  // These fields are added by JOIN queries
  company_name?: string;
  ticker?: string;
}

export interface AnalysisStep {
  id: number;
  evaluation_id: number;
  step_name: string;
  step_type: 'ai' | 'manual'; // AI-driven or self-implemented
  source: string; // e.g., "Financial Statements", "News Articles", "Market Sentiment"
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  score: number; // -100 to 100
  sentiment: 'positive' | 'negative' | 'neutral';
  raw_data: string; // JSON string of the raw analysis
  summary: string;
  key_points: string; // JSON array of key insights
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface WorkflowStepDefinition {
  name: string;
  type: 'ai' | 'manual';
  source: string;
  description: string;
  order: number;
  enabled: boolean;
}

export const DEFAULT_WORKFLOW_STEPS: WorkflowStepDefinition[] = [
  {
    name: 'financial_statements',
    type: 'ai',
    source: 'Financial Statements Analysis',
    description:
      'Analyze company financial statements including balance sheet, income statement, and cash flow',
    order: 1,
    enabled: true,
  },
  {
    name: 'quarterly_financials',
    type: 'ai',
    source: 'Quarterly Financial Results',
    description: 'Review recent quarterly earnings and financial performance',
    order: 2,
    enabled: true,
  },
  {
    name: 'market_sentiment',
    type: 'ai',
    source: 'Market Sentiment Analysis',
    description: 'Analyze market sentiment and trading patterns',
    order: 3,
    enabled: true,
  },
  {
    name: 'news_analysis',
    type: 'ai',
    source: 'News & Media Coverage',
    description: 'Review recent news articles and media coverage',
    order: 4,
    enabled: true,
  },
  {
    name: 'analyst_reports',
    type: 'ai',
    source: 'Analyst Reports',
    description: 'Analyze professional analyst reports and price targets',
    order: 5,
    enabled: true,
  },
  {
    name: 'competitive_analysis',
    type: 'ai',
    source: 'Competitive Positioning',
    description: 'Compare company against competitors and industry benchmarks',
    order: 6,
    enabled: true,
  },
];
