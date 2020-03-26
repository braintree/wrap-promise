const once = require('../lib/once');

describe('once', () => {
  it('only calls function once', () => {
    let funcOnlyCalledOnce;
    const spy = jest.fn();

    function func() {
      spy();
    }
    funcOnlyCalledOnce = once(func);

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
