var once = require('../lib/once');

describe('once', function () {
  it('only calls function once', function () {
    var funcOnlyCalledOnce;
    var spy = jest.fn();

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
