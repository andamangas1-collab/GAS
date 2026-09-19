// ============================================================
// GAS™ MVP — Structured Logger
// Simple console-based logger. Replace with Winston/Pino in V2.
// ============================================================

type LogLevel = "debug" | "info" | "warn" | "error"

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  meta?: Record<string, unknown>
}

const isDev = process.env.NODE_ENV === "development"
const isServer = typeof window === "undefined"

function formatLog(entry: LogEntry): string {
  const base = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`
  if (entry.meta && Object.keys(entry.meta).length > 0) {
    return `${base} ${JSON.stringify(entry.meta)}`
  }
  return base
}

function createLogEntry(level: LogLevel, message: string, meta?: Record<string, unknown>): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    meta,
  }
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>): void {
    if (!isDev) return
    const entry = createLogEntry("debug", message, meta)
    console.info(formatLog(entry))
  },

  info(message: string, meta?: Record<string, unknown>): void {
    const entry = createLogEntry("info", message, meta)
    console.info(formatLog(entry))
  },

  warn(message: string, meta?: Record<string, unknown>): void {
    const entry = createLogEntry("warn", message, meta)
    console.warn(formatLog(entry))
  },

  error(message: string, meta?: Record<string, unknown>): void {
    const entry = createLogEntry("error", message, meta)
    console.error(formatLog(entry))
  },

  /** Log an API request (server-side only) */
  request(method: string, path: string, userId?: string): void {
    if (!isServer) return
    this.info(`${method} ${path}`, { userId: userId ?? "anonymous" })
  },

  /** Log an API error with stack (server-side only) */
  apiError(error: unknown, context?: string): void {
    if (!isServer) return
    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : undefined
    this.error(`API Error${context ? ` [${context}]` : ""}: ${message}`, {
      ...(stack && isDev ? { stack } : {}),
    })
  },
}
