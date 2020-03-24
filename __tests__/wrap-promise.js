var wrapPromise = require('../wrap-promise');

function noop() {}

describe('wrapPromise', function () {
  it('returns a function', function () {
    var fn = wrapPromise(noop);

    expect(fn).toBeInstanceOf(Function);
  });

  describe('functions without callbacks', function () {
    it('invokes first parameter', function () {
      var returnValue = {foo: 'bar'};
      var fn;

      function dummy() {
        return returnValue;
      }

      fn = wrapPromise(dummy);

      expect(fn()).toBe(returnValue);
    });

    it('passes argument to first parameter', function (done) {
      var fn;
      var options = {
        foo: 'bar'
      };

      function dummy(data) {
        expect(data).toBe(options);

        done();
      }

      fn = wrapPromise(dummy);

      fn(options);
    });

    it('passes along many arguments to first parameter', function (done) {
      var fn;
      var firstArg = {
        foo: 'bar'
      };
      var secondArg = {
        bar: 'baz'
      };
      var thirdArg = {
        baz: 'buz'
      };

      function dummy(one, two, three) {
        expect(one).toBe(firstArg);
        expect(two).toBe(secondArg);
        expect(three).toBe(thirdArg);

        done();
      }

      fn = wrapPromise(dummy);

      fn(firstArg, secondArg, thirdArg);
    });
  });

  describe('last parameter is a callback', function () {
    it('does not pass callback to the first param function', function () {
      var promise = new Promise(noop);
      var dummy = jest.fn().mockReturnValue(promise);
      var fn = wrapPromise(dummy);
      var cb = noop;
      var arg1 = {};
      var arg2 = {};

      fn(arg1, arg2, cb);

      expect(dummy).toBeCalledTimes(1);
      expect(dummy).toBeCalledWith(arg1, arg2);
    });

    it('calls the callback with resolved promise', function (done) {
      var data = {foo: 'bar'};
      var promise = Promise.resolve(data);
      var dummy = jest.fn().mockReturnValue(promise);
      var fn = wrapPromise(dummy);

      fn({}, function (err, resolvedData) {
        expect(err).toBeFalsy();
        expect(resolvedData).toBe(data);

        done();
      });
    });

    it('calls the callback with rejected promise', function (done) {
      var error = new Error('An Error');
      var promise = Promise.reject(error);
      var dummy = jest.fn().mockReturnValue(promise);
      var fn = wrapPromise(dummy);

      fn({}, function (err, resolvedData) {
        expect(resolvedData).toBeFalsy();
        expect(err).toBe(error);

        done();
      });
    });
  });

  describe('wrapPrototype', function () {
    let MyObject;

    beforeEach(function () {
      function CustomObject(value) {
        this.value = value;
      }

      CustomObject.prototype.myAsyncMethod = function (succeed) {
        if (succeed) {
          return Promise.resolve('yay');
        }

        return Promise.reject('boo');
      };

      CustomObject.prototype.mySecondAsyncMethod = function (succeed) {
        if (succeed) {
          return Promise.resolve('yay');
        }

        return Promise.reject('boo');
      };

      CustomObject.prototype.myAsyncMethodWithContext = function () {
        return Promise.resolve(this.value);
      };

      CustomObject.myStaticMethod = function (succeed) {
        if (succeed) {
          return Promise.resolve('yay');
        }

        return Promise.reject('boo');
      };

      CustomObject.prototype.mySyncMethod = function (succeed) {
        if (succeed) {
          return 'yay';
        }

        return 'boo';
      };

      CustomObject.prototype._myPrivateMethod = function () {
        return Promise.resolve('yay');
      };

      CustomObject.prototype.propertyOnPrototype = 'Not a function';

      MyObject = wrapPromise.wrapPrototype(CustomObject);
    });

    it('ignores static methods', function () {
      var returnValue = MyObject.myStaticMethod(true, function () {});

      // if it had converted it, the return
      // value would be undefined
      expect(returnValue).toBeInstanceOf(Promise);
    });

    it('ignores sync methods', function () {
      var obj = new MyObject();
      var returnValue = obj.mySyncMethod(true);

      expect(returnValue).toBe('yay');
    });

    it('ignores non-methods on the prototype', function () {
      var obj = new MyObject();

      expect(obj.propertyOnPrototype).toBe('Not a function');
    });

    it('ignores private methods', function () {
      var obj = new MyObject();

      expect(obj._myPrivateMethod(noop)).toBeInstanceOf(Promise);
    });

    it('ignores the constructor', function () {
      var obj = new MyObject();

      expect(obj.constructor.toString()).toMatch(/^function CustomObject\(/);
    });

    it('can pass in an options object to ignore methods', function () {
      var obj;

      function MyOtherObject() {}

      MyOtherObject.prototype.transformMe = function () {
        return Promise.resolve('yay');
      };
      MyOtherObject.prototype.ignoreMe = function (cb) {
        cb();

        return 'not a promise';
      };
      MyOtherObject.prototype.alsoIgnoreMe = function (cb) {
        cb();

        return 'also not a promise';
      };

      wrapPromise.wrapPrototype(MyOtherObject, {
        ignoreMethods: ['ignoreMe', 'alsoIgnoreMe']
      });

      obj = new MyOtherObject();

      expect(obj.transformMe(noop)).toBeUndefined();
      expect(function () {
        obj.ignoreMe(noop);
      }).not.toThrowError();
      expect(function () {
        obj.alsoIgnoreMe(noop);
      }).not.toThrowError();
    });

    it('can pass in an options object to include methods with leading underscores', function (done) {
      var obj;

      function MyOtherObject() {}

      MyOtherObject.prototype._doNotIgnoreMe = function () {
        return Promise.resolve('yay');
      };

      wrapPromise.wrapPrototype(MyOtherObject, {
        transformPrivateMethods: true
      });

      obj = new MyOtherObject();

      obj._doNotIgnoreMe(function (err, res) {
        expect(res).toBe('yay');
        done();
      });
    });

    describe('wraps each method on the prototype to use callbacks', function () {
      it('happy path', function (done) {
        var obj = new MyObject();
        var returnValue = 'not undefined';

        returnValue = obj.myAsyncMethod(true, function (err, res) {
          expect(returnValue).toBeUndefined(); // eslint-disable-line no-undefined
          expect(err).toBeFalsy();
          expect(res).toBe('yay');
          done();
        });
      });

      it('sad path', function (done) {
        var obj = new MyObject();
        var returnValue = 'not undefined';

        returnValue = obj.myAsyncMethod(false, function (err, res) {
          expect(returnValue).toBeUndefined(); // eslint-disable-line no-undefined
          expect(res).toBeFalsy();
          expect(err).toBe('boo');
          done();
        });
      });

      it('works on all protoypical methods', function (done) {
        var obj = new MyObject();
        var returnValue = 'not undefined';

        returnValue = obj.mySecondAsyncMethod(true, function (err, res) {
          expect(returnValue).toBeUndefined(); // eslint-disable-line no-undefined
          expect(err).toBeFalsy();
          expect(res).toBe('yay');
          done();
        });
      });

      it('respects `this`', function (done) {
        var obj = new MyObject('foo');

        obj.myAsyncMethodWithContext(function (err, res) {
          expect(res).toBe('foo');
          done();
        });
      });
    });

    describe('wraps each method on the prototype to and maintains promise behavior', function () {
      it('happy path', function () {
        var obj = new MyObject();
        var returnValue = obj.myAsyncMethod(true);

        expect(returnValue).toBeInstanceOf(Promise);

        return returnValue.then(function (res) {
          expect(res).toBe('yay');
        });
      });

      it('sad path', function () {
        var obj = new MyObject();
        var returnValue = obj.myAsyncMethod(false);

        expect(returnValue).toBeInstanceOf(Promise);

        return returnValue.then(function () {
          throw new Error('should not get here');
        }).catch(function (err) {
          expect(err).toBe('boo');
        });
      });

      it('works on all protoypical methods', function () {
        var obj = new MyObject();
        var returnValue = obj.mySecondAsyncMethod(true);

        expect(returnValue).toBeInstanceOf(Promise);

        return returnValue.then(function (res) {
          expect(res).toBe('yay');
        });
      });

      it('respects `this`', function () {
        var obj = new MyObject('foo');

        return obj.myAsyncMethodWithContext().then(function (res) {
          expect(res).toBe('foo');
        });
      });
    });
  });
});
