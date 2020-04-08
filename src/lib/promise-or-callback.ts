/* eslint-disable consistent-return */
export default function promiseOrCallback(
  promise: Promise<unknown>,
  callback?: Function
): Function | Promise<unknown> {
  if (!callback) {
    return promise;
  }

  promise.then((data) => callback(null, data)).catch((err) => callback(err));
}
