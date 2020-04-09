export default function once(fn: (...args: unknown[]) => void): Function {
  let called = false;

  return function (...args: Parameters<typeof fn>): void {
    if (!called) {
      called = true;
      fn(...args);
    }
  };
}
