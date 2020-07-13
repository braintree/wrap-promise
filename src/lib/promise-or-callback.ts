/* eslint-disable consistent-return */
export function promiseOrCallback<T>(
  promise: Promise<T>,
  callback?: (error: Error | null, data?: T) => void
): void | Promise<unknown> {
  if (!callback) {
    return promise;
  }

  promise.then((data) => callback(null, data)).catch((err) => callback(err));
}
