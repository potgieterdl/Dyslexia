'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';

interface AnalysisStep {
  id: number;
  step_name: string;
  source: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  score: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  summary: string;
  key_points: string;
  error_message?: string;
}

interface Evaluation {
  id: number;
  company_name?: string;
  ticker?: string;
  overall_rating: 'buy' | 'hold' | 'sell';
  overall_score: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

interface AnalysisResultsProps {
  evaluationId: number;
  onUpdate?: () => void;
}

export function AnalysisResults({ evaluationId, onUpdate }: AnalysisResultsProps) {
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [steps, setSteps] = useState<AnalysisStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/evaluations/${evaluationId}`);
      if (response.ok) {
        const data = await response.json();
        setEvaluation(data.evaluation);
        setSteps(data.steps);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();

    // Poll for updates while analysis is in progress
    const interval = setInterval(() => {
      if (evaluation?.status === 'in_progress' || evaluation?.status === 'pending') {
        fetchResults();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [evaluationId, evaluation?.status]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/evaluations/${evaluationId}/update`, {
        method: 'POST',
      });
      if (response.ok) {
        onUpdate?.();
        fetchResults();
      }
    } catch (error) {
      console.error('Error updating evaluation:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Evaluation not found
      </div>
    );
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'buy':
        return 'success';
      case 'sell':
        return 'destructive';
      default:
        return 'warning';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-4 w-4" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'in_progress':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-muted" />;
    }
  };

  const completedSteps = steps.filter((s) => s.status === 'completed').length;
  const totalSteps = steps.length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Overall Rating Card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl">
                {evaluation.company_name || 'Company'}
                {evaluation.ticker && (
                  <span className="text-muted-foreground ml-2">
                    ({evaluation.ticker})
                  </span>
                )}
              </CardTitle>
              <CardDescription>Investment Analysis Report</CardDescription>
            </div>
            <Button
              onClick={handleUpdate}
              disabled={isUpdating || evaluation.status === 'in_progress'}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
              Update
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Overall Rating</div>
                <Badge
                  variant={getRatingColor(evaluation.overall_rating)}
                  className="text-lg px-4 py-1"
                >
                  {evaluation.overall_rating?.toUpperCase()}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">Overall Score</div>
                <div className="text-3xl font-bold">
                  {evaluation.overall_score > 0 ? '+' : ''}
                  {evaluation.overall_score}
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-2">
                Analysis Progress: {completedSteps} / {totalSteps}
              </div>
              <Progress value={progressPercentage} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Steps */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Detailed Analysis</h3>
        {steps.map((step) => {
          const keyPoints = step.key_points ? JSON.parse(step.key_points) : [];

          return (
            <Card key={step.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(step.status)}
                    <div className="flex-1">
                      <CardTitle className="text-lg">{step.source}</CardTitle>
                      {step.status === 'completed' && (
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={step.sentiment === 'positive' ? 'success' : step.sentiment === 'negative' ? 'destructive' : 'secondary'}>
                            {getSentimentIcon(step.sentiment)}
                            <span className="ml-1">{step.sentiment}</span>
                          </Badge>
                          <span className="text-sm font-semibold">
                            Score: {step.score > 0 ? '+' : ''}{step.score}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              {step.status === 'completed' && (
                <CardContent className="space-y-3">
                  <p className="text-sm">{step.summary}</p>
                  {keyPoints.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Key Points:</div>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {keyPoints.map((point: string, idx: number) => (
                          <li key={idx}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              )}
              {step.status === 'failed' && step.error_message && (
                <CardContent>
                  <div className="text-sm text-destructive">{step.error_message}</div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
