/**
 * Test 3: Per-domain rate limiter
 * Tests that the token bucket correctly limits requests per domain
 */

import { checkRateLimit } from '../src/utils/rateLimiter';

describe('checkRateLimit', () => {
  it('allows requests within the rate limit', () => {
    const domain = `test-domain-${Date.now()}.com`;
    const ratePerMin = 5;

    // First 5 requests should succeed
    for (let i = 0; i < ratePerMin; i++) {
      expect(checkRateLimit(domain, ratePerMin)).toBe(true);
    }
  });

  it('blocks requests that exceed the rate limit', () => {
    const domain = `blocked-domain-${Date.now()}.com`;
    const ratePerMin = 3;

    // Exhaust the bucket
    checkRateLimit(domain, ratePerMin);
    checkRateLimit(domain, ratePerMin);
    checkRateLimit(domain, ratePerMin);

    // Next request should be blocked
    expect(checkRateLimit(domain, ratePerMin)).toBe(false);
  });

  it('tracks separate buckets per domain', () => {
    const domain1 = `domain1-${Date.now()}.com`;
    const domain2 = `domain2-${Date.now()}.com`;
    const ratePerMin = 2;

    // Exhaust domain1
    checkRateLimit(domain1, ratePerMin);
    checkRateLimit(domain1, ratePerMin);
    expect(checkRateLimit(domain1, ratePerMin)).toBe(false);

    // domain2 should still be allowed
    expect(checkRateLimit(domain2, ratePerMin)).toBe(true);
  });

  it('starts with full tokens for new domain', () => {
    const domain = `fresh-domain-${Date.now()}.com`;
    // New domain should immediately allow requests
    expect(checkRateLimit(domain, 10)).toBe(true);
  });
});
