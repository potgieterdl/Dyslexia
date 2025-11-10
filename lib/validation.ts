import { z } from 'zod';

/**
 * Validation schema for company analysis request
 */
export const analysisRequestSchema = z.object({
  companyName: z
    .string()
    .min(1, 'Company name is required')
    .max(200, 'Company name must be less than 200 characters')
    .trim(),
  ticker: z
    .string()
    .min(1, 'Ticker symbol must be at least 1 character')
    .max(10, 'Ticker symbol must be less than 10 characters')
    .toUpperCase()
    .regex(/^[A-Z0-9.-]+$/, 'Ticker symbol must contain only letters, numbers, dots, and hyphens')
    .optional()
    .or(z.literal('')),
});

export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;

/**
 * Validation schema for evaluation ID parameter
 */
export const evaluationIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'Evaluation ID must be a valid number')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, 'Evaluation ID must be greater than 0'),
});

export type EvaluationIdParam = z.infer<typeof evaluationIdSchema>;

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent basic XSS
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers like onclick=
}

/**
 * Validate and sanitize company name
 */
export function validateCompanyName(name: string): string {
  const sanitized = sanitizeString(name);

  if (sanitized.length === 0) {
    throw new Error('Company name cannot be empty');
  }

  if (sanitized.length > 200) {
    throw new Error('Company name must be less than 200 characters');
  }

  return sanitized;
}

/**
 * Validate and sanitize ticker symbol
 */
export function validateTicker(ticker: string | undefined | null): string | undefined {
  if (!ticker || ticker.trim() === '') {
    return undefined;
  }

  const sanitized = sanitizeString(ticker).toUpperCase();

  if (sanitized.length > 10) {
    throw new Error('Ticker symbol must be less than 10 characters');
  }

  if (!/^[A-Z0-9.-]+$/.test(sanitized)) {
    throw new Error('Ticker symbol must contain only letters, numbers, dots, and hyphens');
  }

  return sanitized;
}
