# wrap-promise

Small module to help support APIs that return a promise or use a callback.

### Example

```js
// my-method.js
var wrapPromise = require('wrap-promise');

function myMethod (arg) {
  return new Promise(function (resolve, reject) {
    doSomethingAsync(arg, function (err, response) {
      if (err) {
        reject(err);
        return;
      }

      resolve(response);
    });
  });
}

module.exports = wrapPromise(myMethod);

// my-app.js
var myMethod = require('./my-method');

myMethod('foo').then(function (response) {
  // do something with response
}).catch(function (err) {
  // handle error
});

myMethod('foo', function (err, response) {
  if (err) {
    // handle error
    return;
  }

  // do something with response
});
```
