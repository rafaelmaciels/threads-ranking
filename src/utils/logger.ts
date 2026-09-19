type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  provider?: string;
  username?: string;
  durationMs?: number;
  postCount?: number;
  jobId?: string;
  error?: unknown;
  [key: string]: unknown;
}

const SANITIZED_KEYS = ['token', 'secret', 'password', 'key', 'authorization', 'bearer'];

function sanitizeContext(context: LogContext): LogContext {
  const sanitized: LogContext = {};
  for (const [key, value] of Object.entries(context)) {
    const isSensitive = SANITIZED_KEYS.some((k) => key.toLowerCase().includes(k));
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (value instanceof Error) {
      sanitized[key] = {
        name: value.name,
        message: value.message,
        stack: process.env.NODE_ENV === 'development' ? value.stack : undefined,
      };
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function formatLog(level: LogLevel, message: string, context?: LogContext) {
  const payload = {
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    message,
    ...(context ? sanitizeContext(context) : {}),
  };

  if (process.env.NODE_ENV === 'development') {
    const colorMap = {
      info: '\x1b[36m', // Cyan
      warn: '\x1b[33m', // Yellow
      error: '\x1b[31m', // Red
      debug: '\x1b[90m', // Gray
    };
    const reset = '\x1b[0m';
    console.log(
      `${colorMap[level]}[${payload.timestamp}] [${payload.level}]${reset} ${message}`,
      context ? sanitizeContext(context) : ''
    );
  } else {
    console.log(JSON.stringify(payload));
  }
}

export const logger = {
  info: (msg: string, ctx?: LogContext) => formatLog('info', msg, ctx),
  warn: (msg: string, ctx?: LogContext) => formatLog('warn', msg, ctx),
  error: (msg: string, ctx?: LogContext) => formatLog('error', msg, ctx),
  debug: (msg: string, ctx?: LogContext) => formatLog('debug', msg, ctx),
};
