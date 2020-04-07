import deferred from "./lib/deferred";
import once from "./lib/once";
import promiseOrCallback from "./lib/promise-or-callback";

type WrapPrototypeOptions = {
  ignoreMethods?: string[];
  transformPrivateMethods?: boolean;
};

function wrapPromise(fn: Function): Function {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (...args): Function | Promise<any> {
    let callback;
    const lastArg = args[args.length - 1];

    if (typeof lastArg === "function") {
      callback = args.pop();
      callback = once(deferred(callback));
    }

    return promiseOrCallback(fn.apply(this, args), callback); // eslint-disable-line no-invalid-this
  };
}

wrapPromise.wrapPrototype = function (
  target,
  options: WrapPrototypeOptions = {}
): void {
  const ignoreMethods = options.ignoreMethods || [];
  const includePrivateMethods = options.transformPrivateMethods === true;
  const methods = Object.getOwnPropertyNames(target.prototype).filter(
    (method) => {
      let isNotPrivateMethod;
      const isNonConstructorFunction =
        method !== "constructor" &&
        typeof target.prototype[method] === "function";
      const isNotAnIgnoredMethod = ignoreMethods.indexOf(method) === -1;

      if (includePrivateMethods) {
        isNotPrivateMethod = true;
      } else {
        isNotPrivateMethod = method.charAt(0) !== "_";
      }

      return (
        isNonConstructorFunction && isNotPrivateMethod && isNotAnIgnoredMethod
      );
    }
  );

  methods.forEach((method) => {
    const original = target.prototype[method];

    target.prototype[method] = wrapPromise(original);
  });

  return target;
};

export = wrapPromise;
