import Keyv from 'keyv';
import {
  KeyvIndexedDB,
} from '../src';
import keyvTestSuite, {keyvIteratorTests,} from '@keyv/test-suite';
import * as test from 'vitest';

const store = () => new KeyvIndexedDB({
})



keyvTestSuite(test, Keyv, store);
keyvIteratorTests(test, Keyv, store);
