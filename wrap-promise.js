'use strict';

var deferred = require('./lib/deferred');
var once = require('./lib/once');
var promiseOrCallback = require('./lib/promise-or-callback');

function wrapPromise(fn) {
  return function () {
    var callback;
    var args = Array.prototype.slice.call(arguments);
    var lastArg = args[args.length - 1];

    if (typeof lastArg === 'function') {
      callback = args.pop();
      callback = once(deferred(callback));
    }
    return promiseOrCallback(fn.apply(this, args), callback); // eslint-disable-line no-invalid-this
  };
}

module.exports = wrapPromise;
