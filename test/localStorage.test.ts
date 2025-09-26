import Keyv from 'keyv'
import { KeyvIndexedDB, KeyvLocalStorage } from '../src'
import keyvTestSuite, { keyvIteratorTests } from '@keyv/test-suite'
import * as test from 'vitest'

const store = () =>
  new KeyvLocalStorage({
  })

keyvTestSuite(test, Keyv, store)
keyvIteratorTests(test, Keyv, store)
