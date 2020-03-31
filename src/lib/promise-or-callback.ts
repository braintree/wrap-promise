/* eslint-disable consistent-return */
export = function promiseOrCallback(
  promise,
  callback?: Function
): Function | Promise<any> {
  if (!callback) {
    return promise;
  }

  promise.then(data => callback(null, data)).catch(err => callback(err));
};
