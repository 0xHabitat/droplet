// use this file for custom preparations

import assert from 'assert';
import Artifacts from '../Artifacts.js';
import * as shared from './shared.js';

Object.assign(
  globalThis,
  {
    assert,
    Artifacts,
  }
);

for (const k in shared) {
  globalThis[k] = shared[k];
}

console.info(`*** RPC_PORT=${process.env.RPC_PORT} ***`);
