// Simple in-memory token bucket per socket id.
const buckets = new Map<string, { tokens: number; last: number }>();

const CAPACITY = 8;
const REFILL_PER_SEC = 4;

export function allow(socketId: string): boolean {
  const now = Date.now();
  const b = buckets.get(socketId) ?? { tokens: CAPACITY, last: now };
  const elapsed = (now - b.last) / 1000;
  b.tokens = Math.min(CAPACITY, b.tokens + elapsed * REFILL_PER_SEC);
  b.last = now;
  if (b.tokens < 1) {
    buckets.set(socketId, b);
    return false;
  }
  b.tokens -= 1;
  buckets.set(socketId, b);
  return true;
}

export function clear(socketId: string) {
  buckets.delete(socketId);
}
