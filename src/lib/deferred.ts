export function deferred(fn: (...args: unknown[]) => void) {
  return function (...args: Parameters<typeof fn>): void {
    setTimeout(function () {
      try {
        fn(...args);
      } catch (err) {
        /* eslint-disable no-console */
        console.log("Error in callback function");
        console.log(err);
        /* eslint-enable no-console */
      }
    }, 1);
  };
}
