import { NextRequest, NextResponse } from 'next/server';
import { getEvaluation, getAnalysisSteps } from '@/lib/db';

export async function GET(
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

    const steps = getAnalysisSteps(evaluationId);

    return NextResponse.json({
      evaluation,
      steps,
    });
  } catch (error) {
    console.error('Error fetching evaluation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evaluation' },
      { status: 500 }
    );
  }
}
