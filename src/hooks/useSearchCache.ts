import { useState, useCallback } from 'react';

interface CacheEntry {
  data: any;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useSearchCache() {
  const [cache, setCache] = useState<Record<string, CacheEntry>>({});

  const getCachedResult = useCallback((key: string) => {
    const entry = cache[key];
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > CACHE_DURATION) {
      // Cache expired
      delete cache[key];
      setCache({ ...cache });
      return null;
    }

    return entry.data;
  }, [cache]);

  const setCacheResult = useCallback((key: string, data: any) => {
    setCache(prev => ({
      ...prev,
      [key]: {
        data,
        timestamp: Date.now()
      }
    }));
  }, []);

  return { getCachedResult, setCacheResult };
}