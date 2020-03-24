const deferred = require('../lib/deferred');

describe('deferred', () => {
  test('delays the call to the function', done => {
    const fn = jest.fn().mockImplementation(function () {
      expect(arguments.length).toBe(0);

      done();
    });
    const def = deferred(fn);

    def();

    expect(fn).not.toBeCalled();
  });

  test('can pass arguments to the deferred function', done => {
    const fn = jest.fn().mockImplementation(function (a, b) {
      expect(arguments.length).toBe(2);
      expect(a).toBe(1);
      expect(b).toBe(2);

      done();
    });
    const def = deferred(fn);

    def(1, 2);

    expect(fn).not.toBeCalled();
  });

  test('sends message to console if function throws an error', done => {
    let def;
    const error = new Error('simulated error, disregard in test output');

    function funcThatThrows() {
      throw error;
    }
    def = deferred(funcThatThrows);

    jest.spyOn(console, 'log');

    def();

    setTimeout(() => {
      /* eslint-disable no-console */
      expect(console.log).toBeCalledTimes(2);
      expect(console.log).toBeCalledWith('Error in callback function');
      expect(console.log).toBeCalledWith(error);
      /* eslint-enable no-console */

      done();
    }, 5);
  });
});
