export default function deferred(fn: Function): Function {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (...args: any[]): void {
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
