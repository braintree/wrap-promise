/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
export default function promiseOrCallback(
  promise: Promise<any>,
  callback?: Function
): Function | Promise<any> {
  if (!callback) {
    return promise;
  }

  promise.then((data) => callback(null, data)).catch((err) => callback(err));
}
