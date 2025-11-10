export interface WorkflowContext {
  companyName: string;
  ticker?: string;
  evaluationId: number;
  previousStepResults?: Map<string, StepResult>;
}

export interface StepResult {
  success: boolean;
  score: number; // -100 to 100
  sentiment: 'positive' | 'negative' | 'neutral';
  summary: string;
  keyPoints: string[];
  rawData?: any;
  error?: string;
}

export interface WorkflowStep {
  name: string;
  type: 'ai' | 'manual';
  source: string;
  description: string;
  order: number;

  // Execute the step
  execute(context: WorkflowContext): Promise<StepResult>;

  // Validate if the step can run
  canExecute?(context: WorkflowContext): boolean;
}

export interface WorkflowResult {
  evaluationId: number;
  companyName: string;
  overallRating: 'buy' | 'hold' | 'sell';
  overallScore: number;
  stepResults: Map<string, StepResult>;
  completedAt: Date;
}
