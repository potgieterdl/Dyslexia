import { NextRequest, NextResponse } from 'next/server';
import { getEvaluation, getAnalysisSteps } from '@/lib/db';
import { createErrorResponse, notFoundError, badRequestError } from '@/lib/api-error';
import { logInfo } from '@/lib/logger';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const evaluationId = parseInt(id, 10);

    if (isNaN(evaluationId) || evaluationId <= 0) {
      throw badRequestError('Invalid evaluation ID', { id });
    }

    logInfo('Fetching evaluation', { evaluationId });

    const evaluation = getEvaluation(evaluationId);

    if (!evaluation) {
      throw notFoundError('Evaluation not found', { evaluationId });
    }

    const steps = getAnalysisSteps(evaluationId);

    return NextResponse.json({
      evaluation,
      steps,
    });
  } catch (error) {
    return createErrorResponse(error, `GET /api/evaluations/${(await params).id}`);
  }
}
