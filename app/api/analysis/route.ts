import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateCompany, createEvaluation } from '@/lib/db';
import { WorkflowOrchestrator } from '@/lib/workflow/orchestrator';
import { getDefaultWorkflowSteps } from '@/lib/workflow/steps';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, ticker } = body;

    if (!companyName) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    // Get or create company
    const company = getOrCreateCompany(companyName, ticker);

    // Create new evaluation
    const evaluation = createEvaluation(company.id);

    // Start workflow in background (non-blocking)
    const orchestrator = new WorkflowOrchestrator(getDefaultWorkflowSteps());

    // Run workflow asynchronously
    orchestrator
      .execute({
        companyName: company.name,
        ticker: company.ticker,
        evaluationId: evaluation.id,
      })
      .then((result) => {
        console.log('Workflow completed:', result);
      })
      .catch((error) => {
        console.error('Workflow failed:', error);
      });

    return NextResponse.json({
      evaluationId: evaluation.id,
      companyId: company.id,
      status: 'started',
    });
  } catch (error) {
    console.error('Error starting analysis:', error);
    return NextResponse.json({ error: 'Failed to start analysis' }, { status: 500 });
  }
}
