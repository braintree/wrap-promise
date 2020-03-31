export = function once(fn: Function): Function {
  let called = false;

  return function (...args): void {
    if (!called) {
      called = true;
      fn(...args);
    }
  };
};
