import { deferred } from "../../lib/deferred";
import { vi } from "vitest";

describe("deferred", () => {
  it("delays the call to the function", () => {
    const fn = vi.fn((...rest) => {
      expect(rest).toHaveLength(0);
    });
    const def = deferred(fn);

    def();

    expect(fn).not.toBeCalled();
  });

  it("can pass arguments to the deferred function", () => {
    const fn = vi.fn((a, b, ...rest) => {
      expect(rest).toHaveLength(0);
      expect(a).toBe(1);
      expect(b).toBe(2);
    });
    const def = deferred(fn);

    def(1, 2);

    expect(fn).not.toBeCalled();
  });

  it("sends message to console if function throws an error", () => {
    const error = new Error("simulated error");

    function funcThatThrows(): void {
      throw error;
    }
    const def = deferred(funcThatThrows);
    console.log = vi.fn(); // eslint-disable-line no-console

    def();

    setTimeout(() => {
      /* eslint-disable no-console */
      expect(console.log).toBeCalledTimes(2);
      expect(console.log).toBeCalledWith("Error in callback function");
      expect(console.log).toBeCalledWith(error);
    }, 5);
  });
});
