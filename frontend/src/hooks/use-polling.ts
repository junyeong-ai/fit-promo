"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export function usePolling<T>(
  fetcher: () => Promise<T>,
  interval: number,
  enabled: boolean
): { data: T | null; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const poll = useCallback(async () => {
    try {
      const result = await fetcherRef.current();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    poll();
    const id = setInterval(poll, interval);
    return () => clearInterval(id);
  }, [enabled, interval, poll]);

  return { data, loading, error };
}
