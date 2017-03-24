'use strict';

var wrapPromise = require('../wrap-promise');

function noop() {}

describe('wrapPromise', function () {
  it('returns a function', function () {
    var fn = wrapPromise(noop);

    expect(fn).to.be.a('function');
  });

  context('functions without callbacks', function () {
    it('invokes first parameter', function () {
      var returnValue = {foo: 'bar'};
      var fn;

      function dummy() {
        return returnValue;
      }

      fn = wrapPromise(dummy);

      expect(fn()).to.equal(returnValue);
    });

    it('passes argument to first parameter', function (done) {
      var fn;
      var options = {
        foo: 'bar'
      };

      function dummy(data) {
        expect(data).to.equal(options);

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
        expect(one).to.equal(firstArg);
        expect(two).to.equal(secondArg);
        expect(three).to.equal(thirdArg);

        done();
      }

      fn = wrapPromise(dummy);

      fn(firstArg, secondArg, thirdArg);
    });
  });

  context('last parameter is a callback', function () {
    it('does not pass callback to the first param function', function () {
      var promise = new Promise(noop);
      var dummy = this.sandbox.stub().returns(promise);
      var fn = wrapPromise(dummy);
      var cb = noop;
      var arg1 = {};
      var arg2 = {};

      fn(arg1, arg2, cb);

      expect(dummy).to.be.calledWithExactly(arg1, arg2);
    });

    it('calls the callback with resolved promise', function (done) {
      var data = {foo: 'bar'};
      var promise = Promise.resolve(data);
      var dummy = this.sandbox.stub().returns(promise);
      var fn = wrapPromise(dummy);

      fn({}, function (err, resolvedData) {
        expect(err).to.not.exist;
        expect(resolvedData).to.equal(data);

        done();
      });
    });

    it('calls the callback with rejected promise', function (done) {
      var error = new Error('An Error');
      var promise = Promise.reject(error);
      var dummy = this.sandbox.stub().returns(promise);
      var fn = wrapPromise(dummy);

      fn({}, function (err, resolvedData) {
        expect(resolvedData).to.not.exist;
        expect(err).to.equal(error);

        done();
      });
    });
  });

  describe('wrapPrototype', function () {
    beforeEach(function () {
      function MyObject() {}

      MyObject.prototype.myAsyncMethod = function (succeed) {
        if (succeed) {
          return Promise.resolve('yay');
        }

        return Promise.reject('boo');
      };

      MyObject.prototype.mySecondAsyncMethod = function (succeed) {
        if (succeed) {
          return Promise.resolve('yay');
        }

        return Promise.reject('boo');
      };

      MyObject.myStaticMethod = function (succeed) {
        if (succeed) {
          return Promise.resolve('yay');
        }

        return Promise.reject('boo');
      };

      MyObject.prototype.mySyncMethod = function (succeed) {
        if (succeed) {
          return 'yay';
        }

        return 'boo';
      };

      MyObject.prototype.propertyOnPrototype = 'Not a function';

      this.MyObject = wrapPromise.wrapPrototype(MyObject);
    });

    it('ignores static methods', function () {
      var returnValue = this.MyObject.myStaticMethod(true, function () {});

      // if it had converted it, the return
      // value would be undefined
      expect(returnValue).to.be.an.instanceof(Promise);
    });

    it('ignores sync methods', function () {
      var obj = new this.MyObject();
      var returnValue = obj.mySyncMethod(true);

      expect(returnValue).to.equal('yay');
    });

    it('ignores non-methods on the prototype', function () {
      var obj = new this.MyObject();

      expect(obj.propertyOnPrototype).to.equal('Not a function');
    });

    it('ignores the constructor', function () {
      var obj = new this.MyObject();

      expect(obj.constructor.toString()).to.equal('function MyObject() {}');
    });

    it.only('can pass in an options object to ignore methods', function () {
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
        typeof cb;
        cb();

        return 'also not a promise';
      };

      wrapPromise.wrapPrototype(MyOtherObject, {
        ignoreMethods: ['ignoreMe', 'alsoIgnoreMe']
      });

      obj = new MyOtherObject();

      expect(obj.transformMe(noop)).to.be.undefined;
      expect(function () {
        obj.ignoreMe(noop);
      }).to.not.throw();
      expect(function () {
        obj.alsoIgnoreMe(noop);
      }).to.not.throw();
    });

    describe('wraps each method on the prototype to use callbacks', function () {
      it('happy path', function (done) {
        var obj = new this.MyObject();
        var returnValue = 'not undefined';

        returnValue = obj.myAsyncMethod(true, function (err, res) {
          expect(returnValue).to.equal(undefined); // eslint-disable-line no-undefined
          expect(err).to.not.exist;
          expect(res).to.equal('yay');
          done();
        });
      });

      it('sad path', function (done) {
        var obj = new this.MyObject();
        var returnValue = 'not undefined';

        returnValue = obj.myAsyncMethod(false, function (err, res) {
          expect(returnValue).to.equal(undefined); // eslint-disable-line no-undefined
          expect(res).to.not.exist;
          expect(err).to.equal('boo');
          done();
        });
      });

      it('works on all protoypical methods', function (done) {
        var obj = new this.MyObject();
        var returnValue = 'not undefined';

        returnValue = obj.mySecondAsyncMethod(true, function (err, res) {
          expect(returnValue).to.equal(undefined); // eslint-disable-line no-undefined
          expect(err).to.not.exist;
          expect(res).to.equal('yay');
          done();
        });
      });
    });

    describe('wraps each method on the prototype to and maintains promise behavior', function () {
      it('happy path', function () {
        var obj = new this.MyObject();
        var returnValue = obj.myAsyncMethod(true);

        expect(returnValue).to.be.an.instanceof(Promise);

        return returnValue.then(function (res) {
          expect(res).to.equal('yay');
        });
      });

      it('sad path', function () {
        var obj = new this.MyObject();
        var returnValue = obj.myAsyncMethod(false);

        expect(returnValue).to.be.an.instanceof(Promise);

        return returnValue.then(function () {
          throw new Error('should not get here');
        }).catch(function (err) {
          expect(err).to.equal('boo');
        });
      });

      it('works on all protoypical methods', function () {
        var obj = new this.MyObject();
        var returnValue = obj.mySecondAsyncMethod(true);

        expect(returnValue).to.be.an.instanceof(Promise);

        return returnValue.then(function (res) {
          expect(res).to.equal('yay');
        });
      });
    });
  });
});
