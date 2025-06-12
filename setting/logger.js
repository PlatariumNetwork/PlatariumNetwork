// settings/logger.js
import fs from 'fs';
import path from 'path';

// Create directory if it doesn't exist
const logsDir = path.resolve('logs/errors');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Get the log file path with today's date
const getLogFilePath = () => {
  const date = new Date().toISOString().split('T')[0];
  return path.join(logsDir, `${date}.log`);
};

/**
 * Write a log entry to the log file (as a JSON string)
 * @param {Object} logObject - logging object
 */
const writeLog = (logObject) => {
  const line = JSON.stringify(logObject) + '\n';
  fs.appendFileSync(getLogFilePath(), line, 'utf8');
};

// Global error handling
process.on('uncaughtException', (err) => {
  writeLog({
    level: 'error',
    type: 'Uncaught Exception',
    timestamp: new Date().toISOString(),
    message: err.message,
    stack: err.stack,
  });
});

process.on('unhandledRejection', (reason) => {
  writeLog({
    level: 'error',
    type: 'Unhandled Rejection',
    timestamp: new Date().toISOString(),
    message: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : '',
  });
});

/**
 * Validation error class
 */
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Log errors
 * @param {Error|string|Object} err - error, string, or object
 * @param {string} [context] - context (e.g., function name)
 */
export const logError = (err, context = '') => {
  let logObject = {
    level: 'error',
    timestamp: new Date().toISOString(),
    context,
  };

  if (err instanceof Error) {
    logObject.message = err.message;
    logObject.stack = err.stack;
  } else if (typeof err === 'string') {
    logObject.message = err;
  } else if (typeof err === 'object' && err !== null) {
    logObject = { ...logObject, ...err };
  } else {
    logObject.message = String(err);
  }

  writeLog(logObject);
};

/**
 * Informational logging
 * @param {string} message - main message
 * @param {Object} [details] - additional data for the log
 * @param {string} [context] - context (e.g., function name)
 */
export const logInfo = (message, details = {}, context = '') => {
  const logObject = {
    level: 'info',
    timestamp: new Date().toISOString(),
    context,
    message,
    ...details,
  };
  writeLog(logObject);
};

// Console log to confirm logging is active (can be removed)
console.log('[Logging activated]');
