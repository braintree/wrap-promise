'use strict';

export = function once(fn: Function) {
  var called = false;

  return function (...args) {
    if (!called) {
      called = true;
      fn(...args);
    }
  };
}
