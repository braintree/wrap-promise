import once from "../../lib/once";

describe("once", () => {
  it("only calls function once", () => {
    const spy = jest.fn();

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
