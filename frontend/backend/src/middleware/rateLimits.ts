import { Request, Response, NextFunction } from "express";

type Bucket = { count: number; resetAt: number };

function createLimiter(windowMs: number, limit: number, message: string) {
  const store = new Map<string, Bucket>();
  let lastSweep = Date.now();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();

    // Prevent stale IP buckets from accumulating forever in a long-running process.
    if (now - lastSweep >= windowMs) {
      for (const [key, bucket] of store.entries()) {
        if (bucket.resetAt <= now) store.delete(key);
      }
      lastSweep = now;
    }

    const suppliedProxyKey = req.headers["x-synora-proxy-key"];
    const suppliedClientIp = req.headers["x-synora-client-ip"];
    const trustedProxy =
      typeof suppliedProxyKey === "string" &&
      Boolean(process.env.INTERNAL_PROXY_KEY) &&
      suppliedProxyKey === process.env.INTERNAL_PROXY_KEY;
    const key =
      trustedProxy && typeof suppliedClientIp === "string" && suppliedClientIp.trim()
        ? suppliedClientIp.trim().slice(0, 128)
        : req.ip || req.socket.remoteAddress || "unknown";
    const current = store.get(key);
    if (!current || current.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      res.setHeader("X-RateLimit-Limit", limit.toString());
      res.setHeader("X-RateLimit-Remaining", Math.max(limit - 1, 0).toString());
      return next();
    }

    current.count += 1;
    const remaining = Math.max(limit - current.count, 0);
    res.setHeader("X-RateLimit-Limit", limit.toString());
    res.setHeader("X-RateLimit-Remaining", remaining.toString());

    if (current.count > limit) {
      res.setHeader("Retry-After", Math.max(1, Math.ceil((current.resetAt - now) / 1000)).toString());
      return res.status(429).json({ message });
    }
    return next();
  };
}

// These in-process limits are appropriate for a single backend instance / small pilot.
// A multi-instance deployment should move rate limiting to the reverse proxy or a shared
// store such as Redis so every instance sees the same counters.
export const apiLimiter = createLimiter(15 * 60 * 1000, 500, "Too many requests. Please try again shortly.");
export const authLimiter = createLimiter(15 * 60 * 1000, 30, "Too many login attempts. Please wait and try again.");
export const messageLimiter = createLimiter(60 * 1000, 30, "You are sending messages too quickly. Please slow down.");
export const writeLimiter = createLimiter(60 * 1000, 60, "Too many changes in a short time. Please try again shortly.");
