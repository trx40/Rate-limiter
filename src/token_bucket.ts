class TokenBucket {
  private tokens: number;
  private lastRefillTime: number;
  private readonly capacity: number;
  private readonly refillRate: number;

  constructor(capacity: number, refillRate: number) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefillTime = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsedTime = (now - this.lastRefillTime) / 1000;
    const newTokens = Math.floor(elapsedTime * this.refillRate);
    this.tokens = Math.min(this.tokens + newTokens, this.capacity);
    this.lastRefillTime = now;
  }

  public request(): boolean {
    this.refill();
    if (this.tokens > 0) {
      this.tokens--;
      return true; // Request allowed
    } else {
      return false; // Request denied
    }
  }
}

class TokenBucketRateLimiter {
  private buckets: Map<string, TokenBucket>;

  constructor() {
    this.buckets = new Map<string, TokenBucket>();
  }

  public handleRequest(ip: string): boolean {
    let bucket = this.buckets.get(ip);
    // Check if a bucket exists for the IP
    if (!bucket) {
      // Create a new bucket if it doesnt exist
      bucket = new TokenBucket(10, 1); // Capacity:10, Refill rate: 1
      this.buckets.set(ip, bucket);
    }

    if (bucket.request()) {
      // Request allowed
      return true;
    } else {
      // Request denied
      return false;
    }
  }
}

export const tokenBucketRateLimiter = new TokenBucketRateLimiter();
