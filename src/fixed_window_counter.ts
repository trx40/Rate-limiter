class FixedWindowCounter {
  private windowSize: number; // seconds
  private threshold: number;
  // Map of window start times to request count
  private windows: Map<number, number>;

  constructor(windowSize: number, threshold: number) {
    this.windowSize = windowSize;
    this.threshold = threshold;
    this.windows = new Map<number, number>();
  }

  private getCurrentWindowStart(): number {
    const now = Math.floor(Date.now() / 1000); // to seconds
    return now - (now % this.windowSize);
  }

  private cleanupOldWindows(): void {
    const currentWindowStart = this.getCurrentWindowStart();
    for (const [windowStart] of this.windows) {
      if (windowStart + this.windowSize < currentWindowStart) {
        this.windows.delete(windowStart);
      }
    }
  }

  public request(): boolean {
    this.cleanupOldWindows();

    const currentWindowStart = this.getCurrentWindowStart();
    const currentWindowCount = this.windows.get(currentWindowStart) ?? 0;

    if (currentWindowCount >= this.threshold) {
      // Request denied
      return false;
    } else {
      // Increment counter
      this.windows.set(currentWindowStart, currentWindowCount + 1);
      // Request allowed
      return true;
    }
  }
}

class FixedWindowCounterRateLimiter {
  private counters: Map<string, FixedWindowCounter>; // Map IP to window

  constructor() {
    this.counters = new Map<string, FixedWindowCounter>();
  }

  public handleRequest(ip: string): boolean {
    let counter = this.counters.get(ip);

    if (!counter) {
      // Create a new counter for the IP of it doesn't exist
      counter = new FixedWindowCounter(60, 10); // Window size: 60 seconds, Threshold: 10 requests
      this.counters.set(ip, counter);
    }
    return counter.request();
  }
}

export const fixedWindowCounterRateLimiter =
  new FixedWindowCounterRateLimiter();
