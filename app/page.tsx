'use client';

import { useState } from 'react';
import { AnalysisForm } from '@/components/AnalysisForm';
import { AnalysisResults } from '@/components/AnalysisResults';
import { EvaluationsList } from '@/components/EvaluationsList';
import { TrendingUp } from 'lucide-react';

export default function Home() {
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAnalysisStart = (evaluationId: number) => {
    setSelectedEvaluationId(evaluationId);
    setRefreshKey((prev) => prev + 1);
  };

  const handleEvaluationSelect = (evaluationId: number) => {
    setSelectedEvaluationId(evaluationId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Investment Analyzer</h1>
              <p className="text-sm text-muted-foreground">
                AI-Powered Company Analysis with Claude
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Input & History */}
          <div className="lg:col-span-1 space-y-6">
            <AnalysisForm onAnalysisStart={handleAnalysisStart} />
            <EvaluationsList
              onSelect={handleEvaluationSelect}
              refresh={refreshKey}
            />
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-2">
            {selectedEvaluationId ? (
              <AnalysisResults
                evaluationId={selectedEvaluationId}
                onUpdate={() => setRefreshKey((prev) => prev + 1)}
              />
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px] text-center text-muted-foreground border-2 border-dashed rounded-lg">
                <div className="p-8">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-semibold mb-2">No Analysis Selected</h3>
                  <p>Start by analyzing a company or select a past evaluation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            Powered by Claude AI • Investment analysis for educational purposes only
          </p>
        </div>
      </footer>
    </div>
  );
}
