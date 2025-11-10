import { NextRequest, NextResponse } from 'next/server';
import { getEvaluation, updateEvaluation } from '@/lib/db';
import { WorkflowOrchestrator } from '@/lib/workflow/orchestrator';
import { getDefaultWorkflowSteps } from '@/lib/workflow/steps';
import { createErrorResponse, notFoundError, badRequestError } from '@/lib/api-error';
import { logInfo, logError } from '@/lib/logger';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const evaluationId = parseInt(id, 10);

    if (isNaN(evaluationId) || evaluationId <= 0) {
      throw badRequestError('Invalid evaluation ID', { id });
    }

    logInfo('Updating evaluation', { evaluationId });

    const evaluation = getEvaluation(evaluationId);

    if (!evaluation) {
      throw notFoundError('Evaluation not found', { evaluationId });
    }

    // Reset evaluation status
    updateEvaluation(evaluationId, {
      status: 'pending',
      updated_at: new Date().toISOString(),
    });

    logInfo('Restarting workflow for evaluation', {
      evaluationId,
      companyName: evaluation.company_name,
    });

    // Re-run workflow
    const orchestrator = new WorkflowOrchestrator(getDefaultWorkflowSteps());

    orchestrator
      .execute({
        companyName: evaluation.company_name || '',
        ticker: evaluation.ticker,
        evaluationId: evaluation.id,
      })
      .then((result) => {
        logInfo('Updated workflow completed successfully', {
          evaluationId,
          result,
        });
      })
      .catch((error) => {
        logError('Updated workflow failed', error, {
          evaluationId,
          companyName: evaluation.company_name,
        });
      });

    return NextResponse.json({
      evaluationId: evaluation.id,
      status: 'updating',
    });
  } catch (error) {
    return createErrorResponse(error, `POST /api/evaluations/${(await params).id}/update`);
  }
}
