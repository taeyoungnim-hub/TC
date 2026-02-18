/**
 * Per-domain rate limiter using token bucket algorithm.
 * Prevents overloading external sites.
 */

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();

export function checkRateLimit(domain: string, ratePerMin: number): boolean {
  const now = Date.now();
  let bucket = buckets.get(domain);

  if (!bucket) {
    bucket = { tokens: ratePerMin, lastRefill: now };
    buckets.set(domain, bucket);
  }

  // Refill tokens based on elapsed time
  const elapsed = (now - bucket.lastRefill) / 60_000; // minutes
  const refill = Math.floor(elapsed * ratePerMin);
  if (refill > 0) {
    bucket.tokens = Math.min(ratePerMin, bucket.tokens + refill);
    bucket.lastRefill = now;
  }

  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    return true;
  }
  return false;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
