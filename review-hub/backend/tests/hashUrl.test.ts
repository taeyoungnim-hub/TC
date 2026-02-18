/**
 * Test 2: URL hash utility
 * Tests determinism, uniqueness, and consistency of URL hashing for dedup
 */

import { hashUrl, hashIp } from '../src/utils/hash';

describe('hashUrl', () => {
  it('returns a 64-char hex string (SHA-256)', () => {
    const hash = hashUrl('https://example.com/post/1');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('is deterministic - same URL always produces same hash', () => {
    const url = 'https://blog.naver.com/user123/12345678';
    expect(hashUrl(url)).toBe(hashUrl(url));
  });

  it('produces different hashes for different URLs', () => {
    const hash1 = hashUrl('https://example.com/post/1');
    const hash2 = hashUrl('https://example.com/post/2');
    expect(hash1).not.toBe(hash2);
  });

  it('is case-sensitive (URL paths are case-sensitive)', () => {
    const hash1 = hashUrl('https://example.com/Post');
    const hash2 = hashUrl('https://example.com/post');
    expect(hash1).not.toBe(hash2);
  });
});

describe('hashIp', () => {
  it('returns a 64-char hex string', () => {
    const hash = hashIp('192.168.1.1');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('is deterministic', () => {
    const ip = '203.0.113.42';
    expect(hashIp(ip)).toBe(hashIp(ip));
  });

  it('different IPs produce different hashes', () => {
    expect(hashIp('1.2.3.4')).not.toBe(hashIp('5.6.7.8'));
  });
});
