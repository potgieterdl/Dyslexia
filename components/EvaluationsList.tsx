'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { ChevronRight, Loader2 } from 'lucide-react';

interface EvaluationListItem {
  id: number;
  company_name: string;
  ticker?: string;
  overall_rating: 'buy' | 'hold' | 'sell';
  overall_score: number;
  status: string;
  created_at: string;
}

interface EvaluationsListProps {
  onSelect: (evaluationId: number) => void;
  refresh?: number;
}

export function EvaluationsList({ onSelect, refresh }: EvaluationsListProps) {
  const [evaluations, setEvaluations] = useState<EvaluationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvaluations = async () => {
    try {
      const response = await fetch('/api/evaluations');
      if (response.ok) {
        const data = await response.json();
        setEvaluations(data);
      }
    } catch (error) {
      console.error('Error fetching evaluations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, [refresh]);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'in_progress':
        return (
          <Badge variant="secondary">
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
            In Progress
          </Badge>
        );
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Past Evaluations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Past Evaluations</CardTitle>
      </CardHeader>
      <CardContent>
        {evaluations.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            No evaluations yet. Start by analyzing a company above.
          </div>
        ) : (
          <div className="space-y-2">
            {evaluations.map((evaluation) => (
              <Button
                key={evaluation.id}
                variant="ghost"
                className="w-full justify-between h-auto p-4"
                onClick={() => onSelect(evaluation.id)}
              >
                <div className="flex flex-col items-start gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {evaluation.company_name}
                      {evaluation.ticker && (
                        <span className="text-muted-foreground ml-1">
                          ({evaluation.ticker})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {evaluation.status === 'completed' && evaluation.overall_rating && (
                      <Badge variant={getRatingColor(evaluation.overall_rating)}>
                        {evaluation.overall_rating.toUpperCase()}
                      </Badge>
                    )}
                    {getStatusBadge(evaluation.status)}
                    <span className="text-xs text-muted-foreground">
                      {formatDate(evaluation.created_at)}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5" />
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
