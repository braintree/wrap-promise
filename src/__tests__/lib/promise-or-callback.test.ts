/* eslint-disable @typescript-eslint/no-empty-function */
import { promiseOrCallback } from "../../lib/promise-or-callback";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function functionThatReturnsAResolvedPromise(data?: any): Promise<any> {
  return new Promise((resolve) => {
    resolve(data);
  });
}

function functionThatReturnsARejectedPromise(err: Error): Promise<void> {
  return new Promise(() => {
    throw err;
  });
}

describe("promiseOrCallback", () => {
  it("returns promise if no callback is provided", () => {
    const promise = functionThatReturnsAResolvedPromise();
    const isPromise = promiseOrCallback(promise);

    expect(isPromise).toBeInstanceOf(Promise);
  });

  it("does not return a promise if a callback is provided", () => {
    const promise = functionThatReturnsAResolvedPromise();
    const isPromise = promiseOrCallback(promise, () => {});

    expect(isPromise).not.toBeInstanceOf(Promise);
  });

  it("calls callback with error caught from promise", () => {
    const error = new Error("a problem");
    const promise = functionThatReturnsARejectedPromise(error);

    promiseOrCallback(promise, (err) => {
      expect(err).toBe(error);
    });
  });

  it("calls callback with data resolved from promise", () => {
    const data = { foo: "bar" };
    const promise = functionThatReturnsAResolvedPromise(data);

    promiseOrCallback(promise, (err, resolvedData) => {
      expect(err).toBeFalsy();
      expect(resolvedData).toBe(data);
    });
  });
});
