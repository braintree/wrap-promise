'use strict';

export = function deferred(fn: Function) {
  return function (...args: any[]) {
    setTimeout(function () {
      try {
        fn.apply(null, args);
      } catch (err) {
        /* eslint-disable no-console */
        console.log('Error in callback function');
        console.log(err);
        /* eslint-enable no-console */
      }
    }, 1);
  };
}
