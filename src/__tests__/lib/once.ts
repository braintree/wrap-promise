import { once } from "../../lib/once";

describe("once", () => {
  it("only calls function once", () => {
    const spy = jest.fn();

    function func(): void {
      spy();
    }
    const funcOnlyCalledOnce = once(func);

    expect(spy).not.toHaveBeenCalled();

    funcOnlyCalledOnce();

    expect(spy).toHaveBeenCalledTimes(1);

    funcOnlyCalledOnce();
    funcOnlyCalledOnce();
    funcOnlyCalledOnce();
    funcOnlyCalledOnce();

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
