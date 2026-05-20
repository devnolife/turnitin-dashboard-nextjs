const isDev = process.env.NODE_ENV !== "production"

export const logger = {
  info: (...args: unknown[]) => {
    if (isDev) console.log(...args)
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args)
  },
  error: (...args: unknown[]) => {
    // Always log errors, even in production
    console.error(...args)
  },
  debug: (...args: unknown[]) => {
    if (isDev) console.log("[DEBUG]", ...args)
  },
}
