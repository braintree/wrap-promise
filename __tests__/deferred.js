var deferred = require('../lib/deferred');

describe('deferred', function () {
  it('delays the call to the function', function (done) {
    var fn = jest.fn().mockImplementation(function () {
      expect(arguments.length).toBe(0);

      done();
    });
    var def = deferred(fn);

    def();

    expect(fn).not.toBeCalled();
  });

  it('can pass arguments to the deferred function', function (done) {
    var fn = jest.fn().mockImplementation(function (a, b) {
      expect(arguments.length).toBe(2);
      expect(a).toBe(1);
      expect(b).toBe(2);

      done();
    });
    var def = deferred(fn);

    def(1, 2);

    expect(fn).not.toBeCalled();
  });

  it('sends message to console if function throws an error', function (done) {
    var def;
    var error = new Error('simulated error, disregard in test output');

    function funcThatThrows() {
      throw error;
    }
    def = deferred(funcThatThrows);

    jest.spyOn(console, 'log');

    def();

    setTimeout(function () {
      /* eslint-disable no-console */
      expect(console.log).toBeCalledTimes(2);
      expect(console.log).toBeCalledWith('Error in callback function');
      expect(console.log).toBeCalledWith(error);
      /* eslint-enable no-console */

      done();
    }, 5);
  });
});
