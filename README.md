# keyv-browser [<img width="100" align="right" src="https://rawgit.com/lukechilds/keyv/master/media/logo.svg" alt="keyv">](https://github.com/lukechilds/keyv)

> File storage adapter for Keyv, using json to serialize data fast and small.

<!-- [![publish](https://github.com/zaaack/keyv-browser/actions/workflows/publish.yml/badge.svg)](https://github.com/zaaack/keyv-browser/actions/workflows/publish.yml) -->
[![npm](https://img.shields.io/npm/v/keyv-browser.svg)](https://www.npmjs.com/package/keyv-browser)

File storage adapter for [Keyv](https://github.com/lukechilds/keyv).

TTL functionality is handled internally by interval scan, don't need to panic about expired data take too much space.

## Install

```shell
npm install --save keyv keyv-browser
```

## Usage

### Using with keyv
```ts
import Keyv from 'keyv'
import { KeyvLocalStorage, KeyvIndexedDB } from 'keyv-browser'

// localStorage
const keyv = new Keyv({
  store: new KeyvLocalStorage()
});
// indexedDB
const keyv2 = new Keyv({
  store: new KeyvIndexedDB()
})
```

### Using directly

```ts
import { KeyvLocalStorage, makeField } from 'keyv-browser'

class Kv extends KeyvLocalStorage {
  someField = makeField(this, 'field_key', 0)
}

export const kv = new Kv

await kv.someField.get(1) // empty return default value 1
await kv.someField.set(2) // set value 2
await kv.someField.get() // return saved value 2
await kv.someField.delete() // delete field
```

## License

MIT
