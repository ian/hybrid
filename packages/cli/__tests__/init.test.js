'use strict';

const init = require('..');
const assert = require('assert').strict;

assert.strictEqual(init(), 'Hello from init');
console.info("init tests passed");
