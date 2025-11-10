import winston from 'winston';

// Custom format for better readability
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...metadata }) => {
    let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;

    // Add stack trace if available
    if (stack) {
      msg += `\n${stack}`;
    }

    // Add metadata if present
    const metadataKeys = Object.keys(metadata);
    if (metadataKeys.length > 0) {
      msg += `\n${JSON.stringify(metadata, null, 2)}`;
    }

    return msg;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  transports: [
    // Console transport for all environments
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), customFormat),
    }),
  ],
});

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Log unhandled rejections
if (typeof window === 'undefined') {
  process.on('unhandledRejection', (reason: Error | unknown, promise: Promise<unknown>) => {
    logger.error('Unhandled Rejection at:', {
      promise,
      reason: reason instanceof Error ? reason.message : reason,
      stack: reason instanceof Error ? reason.stack : undefined,
    });
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', {
      message: error.message,
      stack: error.stack,
    });
    // Give logger time to write before exiting
    setTimeout(() => process.exit(1), 1000);
  });
}

export default logger;

// Convenience methods for common logging patterns
export const logInfo = (message: string, metadata?: Record<string, unknown>) => {
  logger.info(message, metadata);
};

export const logError = (
  message: string,
  error?: Error | unknown,
  metadata?: Record<string, unknown>
) => {
  logger.error(message, {
    ...metadata,
    error: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
  });
};

export const logWarn = (message: string, metadata?: Record<string, unknown>) => {
  logger.warn(message, metadata);
};

export const logDebug = (message: string, metadata?: Record<string, unknown>) => {
  logger.debug(message, metadata);
};
