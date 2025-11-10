import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateCompany, createEvaluation } from '@/lib/db';
import { WorkflowOrchestrator } from '@/lib/workflow/orchestrator';
import { getDefaultWorkflowSteps } from '@/lib/workflow/steps';
import { analysisRequestSchema } from '@/lib/validation';
import { createErrorResponse, badRequestError } from '@/lib/api-error';
import { logInfo, logError } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = analysisRequestSchema.safeParse(body);

    if (!validationResult.success) {
      throw validationResult.error;
    }

    const { companyName, ticker } = validationResult.data;

    logInfo('Starting company analysis', {
      companyName,
      ticker: ticker || 'N/A',
    });

    // Get or create company
    const company = getOrCreateCompany(companyName, ticker);

    if (!company) {
      throw badRequestError('Failed to create or retrieve company');
    }

    // Create new evaluation
    const evaluation = createEvaluation(company.id);

    if (!evaluation) {
      throw badRequestError('Failed to create evaluation');
    }

    logInfo('Created evaluation', {
      evaluationId: evaluation.id,
      companyId: company.id,
    });

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
        logInfo('Workflow completed successfully', {
          evaluationId: evaluation.id,
          result,
        });
      })
      .catch((error) => {
        logError('Workflow execution failed', error, {
          evaluationId: evaluation.id,
          companyName: company.name,
        });
      });

    return NextResponse.json({
      evaluationId: evaluation.id,
      companyId: company.id,
      status: 'started',
    });
  } catch (error) {
    return createErrorResponse(error, 'POST /api/analysis');
  }
}
