import { NextRequest, NextResponse } from 'next/server';
import { getAllEvaluations } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const evaluations = getAllEvaluations();
    return NextResponse.json(evaluations);
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    return NextResponse.json({ error: 'Failed to fetch evaluations' }, { status: 500 });
  }
}
