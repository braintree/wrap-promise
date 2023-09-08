import { once } from "../../lib/once";
import { vi } from "vitest";

describe("once", () => {
  it("only calls function once", () => {
    const spy = vi.fn();

    function func(): void {
      spy();
    }
    const funcOnlyCalledOnce = once(func);

    expect(spy).not.toBeCalled();

    funcOnlyCalledOnce();

    expect(spy).toBeCalledTimes(1);

    funcOnlyCalledOnce();
    funcOnlyCalledOnce();
    funcOnlyCalledOnce();
    funcOnlyCalledOnce();

    expect(spy).toBeCalledTimes(1);
  });
});
