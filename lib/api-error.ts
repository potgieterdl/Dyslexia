import { NextResponse } from 'next/server';
import { logError, logWarn } from './logger';
import { ZodError } from 'zod';

export enum ErrorCode {
  // Client errors (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Server errors (5xx)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  public code: ErrorCode;
  public status: number;
  public details?: unknown;

  constructor(code: ErrorCode, message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

/**
 * Format Zod validation errors into a readable format
 */
function formatZodError(error: ZodError): Record<string, string[]> {
  const formattedErrors: Record<string, string[]> = {};

  error.issues.forEach((err) => {
    const path = err.path.join('.');
    if (!formattedErrors[path]) {
      formattedErrors[path] = [];
    }
    formattedErrors[path].push(err.message);
  });

  return formattedErrors;
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(error: unknown, context?: string): NextResponse {
  // Handle ApiError
  if (error instanceof ApiError) {
    logWarn(`API Error [${error.code}]: ${error.message}`, {
      context,
      code: error.code,
      details: error.details,
    });

    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.status }
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const formattedErrors = formatZodError(error);

    logWarn('Validation error', {
      context,
      errors: formattedErrors,
    });

    return NextResponse.json(
      {
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Validation failed',
          details: formattedErrors,
        },
      },
      { status: 400 }
    );
  }

  // Handle standard errors
  if (error instanceof Error) {
    logError(`Unexpected error: ${error.message}`, error, { context });

    return NextResponse.json(
      {
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message:
            process.env.NODE_ENV === 'production'
              ? 'An internal server error occurred'
              : error.message,
          details: process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined,
        },
      },
      { status: 500 }
    );
  }

  // Handle unknown errors
  logError('Unknown error type', error, { context });

  return NextResponse.json(
    {
      error: {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred',
      },
    },
    { status: 500 }
  );
}

/**
 * Convenience functions for common error types
 */
export function badRequestError(message: string, details?: unknown): ApiError {
  return new ApiError(ErrorCode.BAD_REQUEST, message, 400, details);
}

export function notFoundError(message: string, details?: unknown): ApiError {
  return new ApiError(ErrorCode.NOT_FOUND, message, 404, details);
}

export function validationError(message: string, details?: unknown): ApiError {
  return new ApiError(ErrorCode.VALIDATION_ERROR, message, 400, details);
}

export function databaseError(message: string, details?: unknown): ApiError {
  return new ApiError(ErrorCode.DATABASE_ERROR, message, 500, details);
}

export function externalApiError(message: string, details?: unknown): ApiError {
  return new ApiError(ErrorCode.EXTERNAL_API_ERROR, message, 502, details);
}

export function internalServerError(message: string, details?: unknown): ApiError {
  return new ApiError(ErrorCode.INTERNAL_SERVER_ERROR, message, 500, details);
}

/**
 * Wrapper for API route handlers to automatically handle errors
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>,
  context?: string
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return createErrorResponse(error, context);
    }
  };
}
