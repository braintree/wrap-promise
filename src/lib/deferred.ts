export = function deferred(fn: Function): Function {
  return function (...args: any[]): void {
    setTimeout(function () {
      try {
        fn(...args);
      } catch (err) {
        /* eslint-disable no-console */
        console.log('Error in callback function');
        console.log(err);
        /* eslint-enable no-console */
      }
    }, 1);
  };
};
