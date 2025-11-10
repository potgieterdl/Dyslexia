import { NextRequest, NextResponse } from 'next/server';
import {
  getEvaluation,
  updateEvaluation,
  getAnalysisSteps,
} from '@/lib/db';
import { WorkflowOrchestrator } from '@/lib/workflow/orchestrator';
import { getDefaultWorkflowSteps } from '@/lib/workflow/steps';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const evaluationId = parseInt(id, 10);

    if (isNaN(evaluationId)) {
      return NextResponse.json(
        { error: 'Invalid evaluation ID' },
        { status: 400 }
      );
    }

    const evaluation = getEvaluation(evaluationId);

    if (!evaluation) {
      return NextResponse.json(
        { error: 'Evaluation not found' },
        { status: 404 }
      );
    }

    // Reset evaluation status
    updateEvaluation(evaluationId, {
      status: 'pending',
      updated_at: new Date().toISOString(),
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
        console.log('Updated workflow completed:', result);
      })
      .catch((error) => {
        console.error('Updated workflow failed:', error);
      });

    return NextResponse.json({
      evaluationId: evaluation.id,
      status: 'updating',
    });
  } catch (error) {
    console.error('Error updating evaluation:', error);
    return NextResponse.json(
      { error: 'Failed to update evaluation' },
      { status: 500 }
    );
  }
}
