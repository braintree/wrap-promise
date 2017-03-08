'use strict';

var sinon = require('sinon');
var chai = require('chai');

chai.use(require('sinon-chai'));

global.expect = chai.expect;

before(function () {
  this.sandbox = sinon.sandbox.create();
});

afterEach(function () {
  this.sandbox.restore();
});
