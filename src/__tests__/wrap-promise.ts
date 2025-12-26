/* eslint-disable @typescript-eslint/ban-ts-comment */
import wrapPromise = require("../wrap-promise");
import { noop } from "./helpers";

describe("wrapPromise", () => {
  let testContext: Record<string, string>;

  beforeEach(() => {
    testContext = {};
  });

  it("returns a function", () => {
    const fn = wrapPromise(noop);

    expect(fn).toBeInstanceOf(Function);
  });

  describe("functions without callbacks", () => {
    it("invokes first parameter", () => {
      const returnValue = { foo: "bar" };
      const fn = wrapPromise(() => returnValue);

      expect(fn()).toBe(returnValue);
    });

    it("passes argument to first parameter", (done) => {
      const options = {
        foo: "bar",
      };

      function dummy(data: unknown): void {
        expect(data).toBe(options);

        done();
      }

      const fn = wrapPromise(dummy);

      fn(options);
    });

    it("passes along many arguments to first parameter", (done) => {
      const firstArg = {
        foo: "bar",
      };
      const secondArg = {
        bar: "baz",
      };
      const thirdArg = {
        baz: "buz",
      };

      function dummy(one: unknown, two: unknown, three: unknown): void {
        expect(one).toBe(firstArg);
        expect(two).toBe(secondArg);
        expect(three).toBe(thirdArg);

        done();
      }

      const fn = wrapPromise(dummy);

      fn(firstArg, secondArg, thirdArg);
    });
  });

  describe("last parameter is a callback", () => {
    it("does not pass callback to the first param function", () => {
      const promise = new Promise(noop);
      const dummy = jest.fn(() => promise);
      const fn = wrapPromise(dummy);
      const arg1 = {};
      const arg2 = {};

      fn(arg1, arg2, noop);

      expect(dummy).toHaveBeenCalledTimes(1);
      expect(dummy).toHaveBeenCalledWith(arg1, arg2);
    });

    it("calls the callback with resolved promise", (done) => {
      const data = { foo: "bar" };
      const promise = Promise.resolve(data);
      const fn = wrapPromise(jest.fn(() => promise));

      fn({}, (err: unknown, resolvedData: unknown) => {
        expect(err).toBeFalsy();
        expect(resolvedData).toBe(data);

        done();
      });
    });

    it("calls the callback with rejected promise", (done) => {
      const error = new Error("An Error");
      const promise = Promise.reject(error);
      const fn = wrapPromise(jest.fn(() => promise));

      fn({}, (err: unknown, resolvedData: unknown) => {
        expect(resolvedData).toBeFalsy();
        expect(err).toBe(error);

        done();
      });
    });
  });

  describe("wrapPrototype", () => {
    class CustomObject {
      propertyOnPrototype: string;

      constructor(value: string) {
        testContext.value = value;

        this.propertyOnPrototype = "Not a function";
      }

      myAsyncMethod(succeed: boolean): Promise<string> {
        if (succeed) {
          return Promise.resolve("yay");
        }

        return Promise.reject("boo");
      }

      mySecondAsyncMethod(succeed: boolean): Promise<string> {
        if (succeed) {
          return Promise.resolve("yay");
        }

        return Promise.reject("boo");
      }

      myAsyncMethodWithContext(): Promise<string> {
        return Promise.resolve(testContext.value);
      }

      static myStaticMethod(succeed: boolean): Promise<string> {
        if (succeed) {
          return Promise.resolve("yay");
        }

        return Promise.reject("boo");
      }

      mySyncMethod(succeed: boolean): string {
        if (succeed) {
          return "yay";
        }

        return "boo";
      }

      _myPrivateMethod(): Promise<string> {
        return Promise.resolve("yay");
      }
    }
    const MyObject = wrapPromise.wrapPrototype(CustomObject);

    it("ignores static methods", () => {
      const returnValue = MyObject.myStaticMethod(true, noop);

      // if it had converted it, the return
      // value would be undefined
      expect(returnValue).toBeInstanceOf(Promise);
    });

    it("ignores sync methods", () => {
      const obj = new MyObject();
      const returnValue = obj.mySyncMethod(true);

      expect(returnValue).toBe("yay");
    });

    it("ignores non-methods on the prototype", () => {
      const obj = new MyObject();

      expect(obj.propertyOnPrototype).toBe("Not a function");
    });

    it("ignores private methods", () => {
      const obj = new MyObject();

      expect(obj._myPrivateMethod(noop)).toBeInstanceOf(Promise);
    });

    it("ignores the constructor", () => {
      const obj = new MyObject();

      expect(obj.constructor.toString()).toMatch(/^function CustomObject\(/);
    });

    it("can pass in an options object to ignore methods", () => {
      type DummyFunction = () => void;

      class MyOtherObject {
        transformMe(): Promise<string> {
          return Promise.resolve("yay");
        }
        ignoreMe(cb: DummyFunction): string {
          cb();

          return "not a promise";
        }
        alsoIgnoreMe(cb: DummyFunction): string {
          cb();

          return "also not a promise";
        }
      }

      wrapPromise.wrapPrototype(MyOtherObject, {
        ignoreMethods: ["ignoreMe", "alsoIgnoreMe"],
      });

      const obj = new MyOtherObject();

      // @ts-ignore: this is what the sdk does. Adds an optional callback argument to a promise api
      expect(obj.transformMe(noop)).toBeUndefined();
      expect(() => {
        obj.ignoreMe(noop);
      }).not.toThrow();
      expect(() => {
        obj.alsoIgnoreMe(noop);
      }).not.toThrow();
    });

    it("can pass in an options object to include methods with leading underscores", (done) => {
      class MyOtherObject {
        _doNotIgnoreMe(): Promise<string> {
          return Promise.resolve("yay");
        }
      }

      wrapPromise.wrapPrototype(MyOtherObject, {
        transformPrivateMethods: true,
      });

      const obj = new MyOtherObject();

      // @ts-ignore: this is what the sdk does. Adds an optional callback argument to a promise api
      obj._doNotIgnoreMe((err, res) => {
        expect(res).toBe("yay");
        done();
      });
    });

    describe("wraps each method on the prototype to use callbacks", () => {
      it("happy path", (done) => {
        const obj = new MyObject();
        let returnValue = "not undefined";

        returnValue = obj.myAsyncMethod(true, (err: Error, res: string) => {
          expect(returnValue).toBeUndefined();
          expect(err).toBeFalsy();
          expect(res).toBe("yay");
          done();
        });
      });

      it("sad path", (done) => {
        const obj = new MyObject();
        let returnValue = "not undefined";

        returnValue = obj.myAsyncMethod(false, (err: Error, res: string) => {
          expect(returnValue).toBeUndefined();
          expect(res).toBeFalsy();
          expect(err).toBe("boo");
          done();
        });
      });

      it("works on all protoypical methods", (done) => {
        const obj = new MyObject();
        let returnValue = "not undefined";

        returnValue = obj.mySecondAsyncMethod(
          true,
          (err: Error, res: string) => {
            expect(returnValue).toBeUndefined();
            expect(err).toBeFalsy();
            expect(res).toBe("yay");
            done();
          }
        );
      });

      it("respects `this`", (done) => {
        const obj = new MyObject("foo");

        obj.myAsyncMethodWithContext((err: Error, res: string) => {
          expect(res).toBe("foo");
          done();
        });
      });
    });

    describe("wraps each method on the prototype to and maintains promise behavior", () => {
      it("happy path", () => {
        const obj = new MyObject();
        const returnValue = obj.myAsyncMethod(true);

        expect(returnValue).toBeInstanceOf(Promise);

        return returnValue.then((res: string) => {
          expect(res).toBe("yay");
        });
      });

      it("sad path", () => {
        const obj = new MyObject();
        const returnValue = obj.myAsyncMethod(false);

        expect(returnValue).toBeInstanceOf(Promise);

        return returnValue
          .then(() => {
            throw new Error("should not get here");
          })
          .catch((err: string) => {
            expect(err).toBe("boo");
          });
      });

      it("works on all protoypical methods", () => {
        const obj = new MyObject();
        const returnValue = obj.mySecondAsyncMethod(true);

        expect(returnValue).toBeInstanceOf(Promise);

        return returnValue.then((res: string) => {
          expect(res).toBe("yay");
        });
      });

      it("respects `this`", () => {
        const obj = new MyObject("foo");

        return obj.myAsyncMethodWithContext().then((res: string) => {
          expect(res).toBe("foo");
        });
      });
    });
  });
});
