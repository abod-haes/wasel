import { useEffect, useState } from 'react';

/** Debounce remote select searches to avoid a request for every keystroke. */
export function useDebouncedSelectSearch(value: string, delay = 350): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
}
