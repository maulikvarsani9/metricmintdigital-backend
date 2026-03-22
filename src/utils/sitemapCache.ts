/**
 * In-memory cache for generated sitemap payloads (no Redis dependency).
 */

interface CacheEntry {
  data: Buffer;
  expiresAt: number;
}

class SitemapCache {
  private memoryCache: Map<string, CacheEntry> = new Map();
  private defaultTTLMs: number = 24 * 60 * 60 * 1000; // 24 hours
  private keyPrefix = 'metricmint:sitemap:';

  async get(key: string): Promise<Buffer | null> {
    const entry = this.memoryCache.get(`${this.keyPrefix}${key}`);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(`${this.keyPrefix}${key}`);
      return null;
    }
    return entry.data;
  }

  async set(key: string, data: Buffer, ttlMs?: number): Promise<void> {
    const ttl = ttlMs || this.defaultTTLMs;
    this.memoryCache.set(`${this.keyPrefix}${key}`, {
      data,
      expiresAt: Date.now() + ttl,
    });
  }

  async delete(key: string): Promise<void> {
    this.memoryCache.delete(`${this.keyPrefix}${key}`);
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
  }

  async invalidate(type: string): Promise<void> {
    const keysToDelete: string[] = [];
    this.memoryCache.forEach((_, k) => {
      if (k.includes(type)) keysToDelete.push(k);
    });
    keysToDelete.forEach(k => this.memoryCache.delete(k));
  }
}

export const sitemapCache = new SitemapCache();
