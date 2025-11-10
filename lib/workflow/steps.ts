import { WorkflowStep, WorkflowContext, StepResult } from './types';
import { claudeAnalyzer } from '../ai/claude';

/**
 * Base class for AI-driven analysis steps
 */
abstract class AIAnalysisStep implements WorkflowStep {
  abstract name: string;
  abstract source: string;
  abstract description: string;
  abstract order: number;
  type: 'ai' = 'ai';

  async execute(context: WorkflowContext): Promise<StepResult> {
    try {
      const result = await claudeAnalyzer.analyze({
        companyName: context.companyName,
        ticker: context.ticker,
        analysisType: this.name,
        context: this.buildContext(context),
      });

      return {
        success: true,
        score: result.score,
        sentiment: result.sentiment,
        summary: result.summary,
        keyPoints: result.keyPoints,
        rawData: {
          rawAnalysis: result.rawAnalysis,
        },
      };
    } catch (error) {
      throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build additional context from previous step results
   */
  protected buildContext(context: WorkflowContext): string | undefined {
    if (!context.previousStepResults || context.previousStepResults.size === 0) {
      return undefined;
    }

    const previousResults = Array.from(context.previousStepResults.entries())
      .map(([stepName, result]) => {
        return `${stepName}: ${result.summary} (Score: ${result.score})`;
      })
      .join('\n');

    return `Previous analysis results:\n${previousResults}`;
  }

  canExecute?(context: WorkflowContext): boolean {
    return true;
  }
}

/**
 * Financial Statements Analysis
 */
export class FinancialStatementsStep extends AIAnalysisStep {
  name = 'financial_statements';
  source = 'Financial Statements Analysis';
  description = 'Analyze company financial statements including balance sheet, income statement, and cash flow';
  order = 1;
}

/**
 * Quarterly Financials Review
 */
export class QuarterlyFinancialsStep extends AIAnalysisStep {
  name = 'quarterly_financials';
  source = 'Quarterly Financial Results';
  description = 'Review recent quarterly earnings and financial performance';
  order = 2;
}

/**
 * Market Sentiment Analysis
 */
export class MarketSentimentStep extends AIAnalysisStep {
  name = 'market_sentiment';
  source = 'Market Sentiment Analysis';
  description = 'Analyze market sentiment and trading patterns';
  order = 3;
}

/**
 * News Analysis
 */
export class NewsAnalysisStep extends AIAnalysisStep {
  name = 'news_analysis';
  source = 'News & Media Coverage';
  description = 'Review recent news articles and media coverage';
  order = 4;
}

/**
 * Analyst Reports Review
 */
export class AnalystReportsStep extends AIAnalysisStep {
  name = 'analyst_reports';
  source = 'Analyst Reports';
  description = 'Analyze professional analyst reports and price targets';
  order = 5;
}

/**
 * Competitive Analysis
 */
export class CompetitiveAnalysisStep extends AIAnalysisStep {
  name = 'competitive_analysis';
  source = 'Competitive Positioning';
  description = 'Compare company against competitors and industry benchmarks';
  order = 6;
}

/**
 * Get all default workflow steps
 */
export function getDefaultWorkflowSteps(): WorkflowStep[] {
  return [
    new FinancialStatementsStep(),
    new QuarterlyFinancialsStep(),
    new MarketSentimentStep(),
    new NewsAnalysisStep(),
    new AnalystReportsStep(),
    new CompetitiveAnalysisStep(),
  ];
}

/**
 * Example: Manual step implementation
 * This shows how to create a custom self-implemented step
 */
export class ManualValuationStep implements WorkflowStep {
  name = 'manual_valuation';
  source = 'Manual Valuation Model';
  description = 'Apply manual valuation techniques (DCF, comparables, etc.)';
  order = 7;
  type: 'manual' = 'manual';

  async execute(context: WorkflowContext): Promise<StepResult> {
    // This is a placeholder for a manual implementation
    // In a real scenario, this might:
    // 1. Fetch financial data from an API
    // 2. Calculate DCF valuation
    // 3. Compare with market cap
    // 4. Return analysis

    return {
      success: true,
      score: 0,
      sentiment: 'neutral',
      summary: 'Manual valuation step requires implementation',
      keyPoints: [
        'Placeholder for manual valuation logic',
        'Can integrate with financial APIs',
        'Implement custom algorithms here',
      ],
    };
  }

  canExecute(context: WorkflowContext): boolean {
    // Only execute if previous steps are successful
    return (
      context.previousStepResults !== undefined &&
      context.previousStepResults.size > 0
    );
  }
}
