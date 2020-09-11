export function once(
  fn: (...args: unknown[]) => void
): (...args: Parameters<typeof fn>) => void {
  let called = false;

  return function (...args: Parameters<typeof fn>): void {
    if (!called) {
      called = true;
      fn(...args);
    }
  };
}
