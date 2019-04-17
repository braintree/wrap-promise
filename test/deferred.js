'use strict';

var deferred = require('../lib/deferred');

describe('deferred', function () {
  it('delays the call to the function', function (done) {
    var fn = this.sandbox.spy(function () {
      expect(arguments.length).to.equal(0);

      done();
    });
    var def = deferred(fn);

    def();

    expect(fn).not.to.be.called;
  });

  it('can pass arguments to the deferred function', function (done) {
    var fn = this.sandbox.spy(function (a, b) {
      expect(arguments.length).to.equal(2);
      expect(a).to.equal(1);
      expect(b).to.equal(2);

      done();
    });
    var def = deferred(fn);

    def(1, 2);

    expect(fn).not.to.be.called;
  });

  it('sends message to console if function throws an error', function (done) {
    var def;
    var error = new Error('simulated error, disregard in test output');

    function funcThatThrows() {
      throw error;
    }
    def = deferred(funcThatThrows);

    this.sandbox.spy(console, 'log');

    def();

    setTimeout(function () {
      /* eslint-disable no-console */
      expect(console.log).to.be.calledTwice;
      expect(console.log).to.be.calledWith('Error in callback function');
      expect(console.log).to.be.calledWith(error);
      /* eslint-enable no-console */

      done();
    }, 5);
  });
});
