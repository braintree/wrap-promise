'use strict';

export = function promiseOrCallback(
  promise: Promise<any>,
  callback?: Function
) { // eslint-disable-line consistent-return
  if (!callback) {
    return promise;
  }

  promise
    .then(data => callback(null, data))
    .catch(err => callback(err));
}
