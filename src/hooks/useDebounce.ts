import { useState, useEffect } from 'react';

/**
 * Returns a debounced version of the given value.
 * The debounced value updates after the specified delay when the input stops changing.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (e.g. 350)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
