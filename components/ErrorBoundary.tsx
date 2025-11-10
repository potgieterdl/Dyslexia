'use client';

import { ReactNode } from 'react';
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

// Fallback component shown when an error occurs
function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <CardTitle>Something went wrong</CardTitle>
          </div>
          <CardDescription>An unexpected error occurred in the application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted p-4">
            <p className="font-mono text-sm text-muted-foreground">{error.message}</p>
          </div>

          {process.env.NODE_ENV === 'development' && error.stack && (
            <details className="rounded-md bg-muted p-4">
              <summary className="cursor-pointer text-sm font-medium">Stack Trace</summary>
              <pre className="mt-2 overflow-auto text-xs text-muted-foreground">{error.stack}</pre>
            </details>
          )}

          <div className="flex gap-2">
            <Button onClick={resetErrorBoundary} className="flex-1">
              Try Again
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()} className="flex-1">
              Reload Page
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            If this problem persists, please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Error handler that logs errors
function errorHandler(error: Error, info: { componentStack?: string | null }) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Boundary caught an error:', error);
    console.error('Component Stack:', info.componentStack);
  }

  // In production, you might want to send this to an error tracking service
  // For now, we'll just log it (Winston logger won't work in browser)
  if (typeof window !== 'undefined') {
    // You could send this to a logging endpoint
    fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        componentStack: info.componentStack,
      }),
    }).catch(() => {
      // Silently fail if logging fails
    });
  }
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback} onError={errorHandler}>
      {children}
    </ReactErrorBoundary>
  );
}
