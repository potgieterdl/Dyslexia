import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AnalysisRequest {
  companyName: string;
  ticker?: string;
  analysisType: string;
  context?: string;
}

export interface AnalysisResponse {
  score: number; // -100 to 100
  sentiment: 'positive' | 'negative' | 'neutral';
  summary: string;
  keyPoints: string[];
  rawAnalysis: string;
}

export class ClaudeAnalyzer {
  private model = 'claude-3-5-sonnet-20241022';

  /**
   * Analyze a company using Claude AI
   */
  async analyze(request: AnalysisRequest): Promise<AnalysisResponse> {
    const prompt = this.buildPrompt(request);

    const message = await anthropic.messages.create({
      model: this.model,
      max_tokens: 4096,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => ('text' in block ? block.text : ''))
      .join('\n');

    return this.parseResponse(responseText);
  }

  /**
   * Build a prompt based on the analysis type
   */
  private buildPrompt(request: AnalysisRequest): string {
    const { companyName, ticker, analysisType, context } = request;
    const tickerInfo = ticker ? ` (${ticker})` : '';

    const baseContext = context ? `\n\nAdditional Context:\n${context}` : '';

    const prompts: Record<string, string> = {
      financial_statements: `
You are a professional financial analyst. Analyze ${companyName}${tickerInfo} based on its financial statements.

Please provide:
1. A numerical score from -100 to 100 (negative = bearish, positive = bullish)
2. Overall sentiment (positive, negative, or neutral)
3. A concise summary (2-3 sentences)
4. 3-5 key points about the company's financial health

Focus on:
- Balance sheet strength (debt levels, liquidity, assets)
- Income statement trends (revenue growth, profitability, margins)
- Cash flow analysis (operating cash flow, free cash flow)
- Financial ratios (P/E, ROE, debt-to-equity, current ratio)

${baseContext}

Format your response as JSON:
{
  "score": <number between -100 and 100>,
  "sentiment": "<positive|negative|neutral>",
  "summary": "<brief summary>",
  "keyPoints": ["<point1>", "<point2>", ...]
}
`,
      quarterly_financials: `
You are a professional financial analyst. Analyze ${companyName}${tickerInfo}'s recent quarterly financial results.

Please provide:
1. A numerical score from -100 to 100 (negative = bearish, positive = bullish)
2. Overall sentiment (positive, negative, or neutral)
3. A concise summary (2-3 sentences)
4. 3-5 key points about the quarterly performance

Focus on:
- Quarter-over-quarter growth trends
- Year-over-year comparisons
- Earnings surprises (beat/miss estimates)
- Revenue trends and guidance
- Management commentary and outlook

${baseContext}

Format your response as JSON:
{
  "score": <number between -100 and 100>,
  "sentiment": "<positive|negative|neutral>",
  "summary": "<brief summary>",
  "keyPoints": ["<point1>", "<point2>", ...]
}
`,
      market_sentiment: `
You are a market sentiment analyst. Analyze the current market sentiment for ${companyName}${tickerInfo}.

Please provide:
1. A numerical score from -100 to 100 (negative = bearish, positive = bullish)
2. Overall sentiment (positive, negative, or neutral)
3. A concise summary (2-3 sentences)
4. 3-5 key points about market sentiment

Focus on:
- Recent stock price performance and trends
- Trading volume and volatility
- Institutional investor activity
- Analyst ratings and price targets
- Social media and investor sentiment

${baseContext}

Format your response as JSON:
{
  "score": <number between -100 and 100>,
  "sentiment": "<positive|negative|neutral>",
  "summary": "<brief summary>",
  "keyPoints": ["<point1>", "<point2>", ...]
}
`,
      news_analysis: `
You are a news analyst specializing in corporate developments. Analyze recent news and media coverage for ${companyName}${tickerInfo}.

Please provide:
1. A numerical score from -100 to 100 (negative = bearish, positive = bullish)
2. Overall sentiment (positive, negative, or neutral)
3. A concise summary (2-3 sentences)
4. 3-5 key points from recent news

Focus on:
- Major announcements and developments
- Product launches or innovations
- Regulatory issues or legal matters
- Management changes
- Strategic partnerships or acquisitions

${baseContext}

Format your response as JSON:
{
  "score": <number between -100 and 100>,
  "sentiment": "<positive|negative|neutral>",
  "summary": "<brief summary>",
  "keyPoints": ["<point1>", "<point2>", ...]
}
`,
      analyst_reports: `
You are analyzing professional analyst reports for ${companyName}${tickerInfo}.

Please provide:
1. A numerical score from -100 to 100 (negative = bearish, positive = bullish)
2. Overall sentiment (positive, negative, or neutral)
3. A concise summary (2-3 sentences)
4. 3-5 key points from analyst perspectives

Focus on:
- Consensus price targets and recommendations
- Recent upgrades or downgrades
- Key investment thesis points
- Risk factors identified by analysts
- Growth projections and estimates

${baseContext}

Format your response as JSON:
{
  "score": <number between -100 and 100>,
  "sentiment": "<positive|negative|neutral>",
  "summary": "<brief summary>",
  "keyPoints": ["<point1>", "<point2>", ...]
}
`,
      competitive_analysis: `
You are a competitive strategy analyst. Analyze ${companyName}${tickerInfo}'s competitive positioning.

Please provide:
1. A numerical score from -100 to 100 (negative = weak position, positive = strong position)
2. Overall sentiment (positive, negative, or neutral)
3. A concise summary (2-3 sentences)
4. 3-5 key points about competitive positioning

Focus on:
- Market share and positioning
- Competitive advantages and moats
- Industry trends and dynamics
- Comparison with key competitors
- Threats and opportunities

${baseContext}

Format your response as JSON:
{
  "score": <number between -100 and 100>,
  "sentiment": "<positive|negative|neutral>",
  "summary": "<brief summary>",
  "keyPoints": ["<point1>", "<point2>", ...]
}
`,
    };

    return (
      prompts[analysisType] ||
      `Analyze ${companyName}${tickerInfo} for investment purposes. ${baseContext}`
    );
  }

  /**
   * Parse Claude's response into structured format
   */
  private parseResponse(responseText: string): AnalysisResponse {
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          score: this.normalizeScore(parsed.score),
          sentiment: this.normalizeSentiment(parsed.sentiment),
          summary: parsed.summary || 'Analysis completed',
          keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
          rawAnalysis: responseText,
        };
      }
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
    }

    // Fallback: try to extract information from text
    return this.parseTextResponse(responseText);
  }

  /**
   * Parse text response when JSON parsing fails
   */
  private parseTextResponse(text: string): AnalysisResponse {
    // Extract score
    const scoreMatch = text.match(/score[:\s]+(-?\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;

    // Extract sentiment
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (text.match(/sentiment[:\s]+(positive|bullish)/i)) sentiment = 'positive';
    if (text.match(/sentiment[:\s]+(negative|bearish)/i)) sentiment = 'negative';

    // Extract key points
    const keyPoints: string[] = [];
    const bulletPoints = text.match(/[-•*]\s+(.+)/g);
    if (bulletPoints) {
      keyPoints.push(...bulletPoints.map((p) => p.replace(/^[-•*]\s+/, '').trim()));
    }

    // Use first paragraph as summary
    const paragraphs = text.split('\n\n').filter((p) => p.trim().length > 0);
    const summary = paragraphs[0]?.substring(0, 200) || 'Analysis completed';

    return {
      score: this.normalizeScore(score),
      sentiment,
      summary,
      keyPoints: keyPoints.slice(0, 5),
      rawAnalysis: text,
    };
  }

  /**
   * Ensure score is within valid range
   */
  private normalizeScore(score: number): number {
    return Math.max(-100, Math.min(100, score));
  }

  /**
   * Ensure sentiment is valid
   */
  private normalizeSentiment(sentiment: string): 'positive' | 'negative' | 'neutral' {
    const normalized = sentiment.toLowerCase();
    if (normalized === 'positive' || normalized === 'bullish') return 'positive';
    if (normalized === 'negative' || normalized === 'bearish') return 'negative';
    return 'neutral';
  }
}

// Export singleton instance
export const claudeAnalyzer = new ClaudeAnalyzer();
