'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';

interface AnalysisFormProps {
  onAnalysisStart: (evaluationId: number) => void;
}

export function AnalysisForm({ onAnalysisStart }: AnalysisFormProps) {
  const [companyName, setCompanyName] = useState('');
  const [ticker, setTicker] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!companyName.trim()) {
      setError('Please enter a company name');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: companyName.trim(),
          ticker: ticker.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start analysis');
      }

      const data = await response.json();
      onAnalysisStart(data.evaluationId);

      // Reset form
      setCompanyName('');
      setTicker('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Analysis</CardTitle>
        <CardDescription>
          Enter a company name to analyze investment potential
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="companyName" className="text-sm font-medium">
              Company Name *
            </label>
            <Input
              id="companyName"
              placeholder="e.g., Apple Inc."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="ticker" className="text-sm font-medium">
              Ticker Symbol (Optional)
            </label>
            <Input
              id="ticker"
              placeholder="e.g., AAPL"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            <Search className="mr-2 h-4 w-4" />
            {isLoading ? 'Starting Analysis...' : 'Analyze Company'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
