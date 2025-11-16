/**
 * Creates a debounced function that delays invoking the provided function until after
 * the specified delay has elapsed since the last time it was invoked
 * @param func The function to debounce
 * @param delay The delay in milliseconds
 * @returns A debounced version of the provided function
 */
export function debounce<T extends unknown[], R>(
  func: (...args: T) => R,
  delay: number
): (...args: T) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
} 