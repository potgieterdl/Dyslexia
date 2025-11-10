import { WorkflowContext, WorkflowStep, StepResult, WorkflowResult } from './types';
import { createAnalysisStep, updateAnalysisStep, updateEvaluation, getAnalysisSteps } from '../db';

export class WorkflowOrchestrator {
  private steps: WorkflowStep[] = [];

  constructor(steps: WorkflowStep[]) {
    // Sort steps by order
    this.steps = [...steps].sort((a, b) => a.order - b.order);
  }

  /**
   * Register a new step in the workflow
   */
  registerStep(step: WorkflowStep): void {
    this.steps.push(step);
    this.steps.sort((a, b) => a.order - b.order);
  }

  /**
   * Execute the entire workflow
   */
  async execute(context: WorkflowContext): Promise<WorkflowResult> {
    const stepResults = new Map<string, StepResult>();

    // Update evaluation status
    updateEvaluation(context.evaluationId, { status: 'in_progress' });

    try {
      for (const step of this.steps) {
        // Check if step can execute
        if (step.canExecute && !step.canExecute(context)) {
          console.log(`Skipping step ${step.name} - conditions not met`);
          continue;
        }

        // Create analysis step record
        const analysisStep = createAnalysisStep(
          context.evaluationId,
          step.name,
          step.type,
          step.source
        );

        // Update status to in_progress
        updateAnalysisStep(analysisStep.id, { status: 'in_progress' });

        try {
          console.log(`Executing step: ${step.name}`);

          // Execute the step
          const result = await step.execute({
            ...context,
            previousStepResults: stepResults,
          });

          // Store result
          stepResults.set(step.name, result);

          // Update analysis step with results
          updateAnalysisStep(analysisStep.id, {
            status: 'completed',
            score: result.score,
            sentiment: result.sentiment,
            summary: result.summary,
            key_points: JSON.stringify(result.keyPoints),
            raw_data: result.rawData ? JSON.stringify(result.rawData) : undefined,
            completed_at: new Date().toISOString(),
          });

          console.log(`Completed step: ${step.name} (score: ${result.score})`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Error executing step ${step.name}:`, errorMessage);

          // Update step with error
          updateAnalysisStep(analysisStep.id, {
            status: 'failed',
            error_message: errorMessage,
            completed_at: new Date().toISOString(),
          });

          // Store failed result
          stepResults.set(step.name, {
            success: false,
            score: 0,
            sentiment: 'neutral',
            summary: `Failed to analyze: ${errorMessage}`,
            keyPoints: [],
            error: errorMessage,
          });
        }
      }

      // Calculate overall rating
      const overallScore = this.calculateOverallScore(stepResults);
      const overallRating = this.scoreToRating(overallScore);

      // Update evaluation with final results
      updateEvaluation(context.evaluationId, {
        status: 'completed',
        overall_score: overallScore,
        overall_rating: overallRating,
        completed_at: new Date().toISOString(),
      });

      return {
        evaluationId: context.evaluationId,
        companyName: context.companyName,
        overallRating,
        overallScore,
        stepResults,
        completedAt: new Date(),
      };
    } catch (error) {
      // Update evaluation as failed
      updateEvaluation(context.evaluationId, {
        status: 'failed',
      });

      throw error;
    }
  }

  /**
   * Calculate overall score from all step results
   */
  private calculateOverallScore(stepResults: Map<string, StepResult>): number {
    const scores = Array.from(stepResults.values())
      .filter((result) => result.success)
      .map((result) => result.score);

    if (scores.length === 0) return 0;

    // Weighted average (can be customized)
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    return Math.round(totalScore / scores.length);
  }

  /**
   * Convert numerical score to buy/hold/sell rating
   */
  private scoreToRating(score: number): 'buy' | 'hold' | 'sell' {
    if (score >= 30) return 'buy';
    if (score <= -30) return 'sell';
    return 'hold';
  }

  /**
   * Get list of registered steps
   */
  getSteps(): WorkflowStep[] {
    return [...this.steps];
  }
}
