'use strict';

var once = require('../lib/once');

describe('once', function () {
  it('only calls function once', function () {
    var funcOnlyCalledOnce;
    var spy = this.sandbox.spy();

    function func() {
      spy();
    }
    funcOnlyCalledOnce = once(func);

    expect(spy).to.not.be.called;

    funcOnlyCalledOnce();

    expect(spy).to.be.calledOnce;

    funcOnlyCalledOnce();
    funcOnlyCalledOnce();
    funcOnlyCalledOnce();
    funcOnlyCalledOnce();

    expect(spy).to.be.calledOnce;
  });
});
