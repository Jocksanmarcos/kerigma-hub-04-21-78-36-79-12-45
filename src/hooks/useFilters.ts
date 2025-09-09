import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

// Generic URL-persisted filters with 700ms debounce
export function useFilters<T extends Record<string, any>>(defaults: T) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize from URL + defaults
  const initial = useMemo(() => {
    const obj: Record<string, any> = { ...defaults };
    for (const [key, value] of searchParams.entries()) {
      // Support array values as comma-separated
      if (value.includes(",")) obj[key] = value.split(",");
      else obj[key] = value;
    }
    return obj as T;
  }, []);

  const [filters, setFilters] = useState<T>(initial);
  const [debouncedFilters, setDebouncedFilters] = useState<T>(initial);

  // Debounce updates used for querying - 700ms para busca de texto
  useEffect(() => {
    const id = setTimeout(() => setDebouncedFilters(filters), 700);
    return () => clearTimeout(id);
  }, [filters]);

  // Persist to URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      if (Array.isArray(v)) {
        if (v.length) params.set(k, v.join(","));
      } else {
        params.set(k, String(v));
      }
    });
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const setFilter = <K extends keyof T>(key: K, value: T[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => setFilters(defaults);

  return { filters, setFilter, clearFilters, debouncedFilters } as const;
}
