/**
 * Hybrid rate limiter.
 *
 * - When `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` are set, uses
 *   Upstash Redis REST (fixed window, atomic via Lua-equivalent INCR+EXPIRE).
 *   Suitable for serverless/edge with multiple instances.
 * - Otherwise falls back to an in-memory Map (dev only — DO NOT use in
 *   production with > 1 instance, the counter is per-process).
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

const CLEANUP_INTERVAL = 60 * 1000 // 1 menit

let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now

  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key)
    }
  }
}

function rateLimitMemory(
  key: string,
  maxAttempts: number,
  windowMs: number
): RateLimitResult {
  cleanup()

  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: maxAttempts - 1, resetAt: now + windowMs }
  }

  if (entry.count >= maxAttempts) {
    return { success: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { success: true, remaining: maxAttempts - entry.count, resetAt: entry.resetAt }
}

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
const upstashEnabled = Boolean(UPSTASH_URL && UPSTASH_TOKEN)

async function upstashPipeline(commands: Array<Array<string | number>>): Promise<unknown[]> {
  const res = await fetch(`${UPSTASH_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    // Keep timeouts tight; rate limit should not stall the request long.
    signal: AbortSignal.timeout(1500),
  })
  if (!res.ok) {
    throw new Error(`Upstash pipeline failed: ${res.status}`)
  }
  return (await res.json()) as unknown[]
}

async function rateLimitUpstash(
  key: string,
  maxAttempts: number,
  windowMs: number
): Promise<RateLimitResult> {
  const windowSec = Math.max(1, Math.floor(windowMs / 1000))
  const ttlKey = `rl:${key}`

  // INCR then EXPIRE NX (only set TTL on first hit of the window).
  const results = (await upstashPipeline([
    ["INCR", ttlKey],
    ["EXPIRE", ttlKey, windowSec, "NX"],
    ["PTTL", ttlKey],
  ])) as Array<{ result: number | string }>

  const count = Number(results[0]?.result ?? 0)
  const pttl = Number(results[2]?.result ?? windowMs)
  const resetAt = Date.now() + (pttl > 0 ? pttl : windowMs)

  if (count > maxAttempts) {
    return { success: false, remaining: 0, resetAt }
  }
  return { success: true, remaining: Math.max(0, maxAttempts - count), resetAt }
}

/**
 * Apply rate limit for the given key. If Upstash is unreachable, fails-open
 * (allows the request) and logs to console — never block traffic on Redis
 * outage.
 */
export async function rateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 menit
): Promise<RateLimitResult> {
  if (!upstashEnabled) {
    return rateLimitMemory(key, maxAttempts, windowMs)
  }

  try {
    return await rateLimitUpstash(key, maxAttempts, windowMs)
  } catch (err) {
    console.error("[rate-limit] upstash failed, falling back to memory:", err)
    return rateLimitMemory(key, maxAttempts, windowMs)
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  const real = request.headers.get("x-real-ip")
  if (real) return real.trim()
  return "unknown"
}

