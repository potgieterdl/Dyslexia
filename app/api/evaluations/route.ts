import { NextResponse } from 'next/server';
import { getAllEvaluations } from '@/lib/db';
import { createErrorResponse } from '@/lib/api-error';
import { logInfo } from '@/lib/logger';

export async function GET() {
  try {
    logInfo('Fetching all evaluations');
    const evaluations = getAllEvaluations();
    return NextResponse.json(evaluations);
  } catch (error) {
    return createErrorResponse(error, 'GET /api/evaluations');
  }
}
