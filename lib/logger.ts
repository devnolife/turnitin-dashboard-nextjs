const isDev = process.env.NODE_ENV !== "production"

const SENSITIVE_KEY_RE = /password|passwd|token|secret|authorization|cookie|api[-_]?key|session/i

function redact(value: unknown, depth = 0): unknown {
  if (depth > 5) return "[Truncated]"
  if (value === null || value === undefined) return value
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return value
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: isDev ? value.stack : undefined,
    }
  }
  if (Array.isArray(value)) {
    return value.map((v) => redact(v, depth + 1))
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEY_RE.test(k)) {
        out[k] = "[REDACTED]"
      } else {
        out[k] = redact(v, depth + 1)
      }
    }
    return out
  }
  return String(value)
}

type Level = "debug" | "info" | "warn" | "error"

function emit(level: Level, args: unknown[]) {
  if (isDev) {
    const fn = level === "debug" ? console.log : console[level]
    fn(...args.map((a) => redact(a)))
    return
  }
  if (level === "debug") return
  const payload = {
    level,
    ts: new Date().toISOString(),
    msg: typeof args[0] === "string" ? args[0] : undefined,
    data: args.length > 1 ? args.slice(1).map((a) => redact(a)) : undefined,
  }
  const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log
  fn(JSON.stringify(payload))
}

export const logger = {
  info: (...args: unknown[]) => emit("info", args),
  warn: (...args: unknown[]) => emit("warn", args),
  error: (...args: unknown[]) => emit("error", args),
  debug: (...args: unknown[]) => emit("debug", args),
}
