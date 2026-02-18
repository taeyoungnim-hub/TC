import crypto from 'crypto';

export function hashUrl(url: string): string {
  return crypto.createHash('sha256').update(url).digest('hex');
}

export function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip + (process.env.IP_SALT ?? 'review-hub')).digest('hex');
}
