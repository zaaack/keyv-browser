'use strict'

import type { IEventEmitter, Keyv, KeyvStoreAdapter, StoredData } from 'keyv'
import * as idb from 'idb-keyval'

export interface Options {
  deserialize: (val: string) => any
  dialect: string
  serialize: (val: any) => string
  namespace?: string
  dbName: string
  storeName: string
}

export const defaultOpts: Options = {
  deserialize: JSON.parse,
  dialect: 'redis',
  serialize: JSON.stringify,
  dbName:'keyv',
  storeName: 'keyv'
}

export class KeyvIndexedDB implements KeyvStoreAdapter {
  public ttlSupport = false
  public namespace = ''
  public opts: Options

  private store: idb.UseStore

  constructor(options?: Partial<Options>) {
    this.opts = Object.assign({}, defaultOpts, options)
    this.store = idb.createStore(this.opts.dbName, this.opts.storeName)
  }
  private _getKey(key: string) {
    if (this.namespace) {
      return `${this.namespace}${key}`
    }
    return key
  }

  private _innerKeyToKey(key: string) {
    if (this.namespace && key.startsWith(this.namespace)) {
      return key.slice(this.namespace.length)
    }
    return key
  }
  on(event: string, listener: (...arguments_: any[]) => void): IEventEmitter {
    // throw new Error('Method not implemented.')
    return this
  }

  public async get<Value>(key: string): Promise<Value | undefined> {
    try {
      const data = await idb.get(this._getKey(key), this.store)
      if (data == null) {
        return
      }
      return data
    } catch (error) {
      // do nothing;
    }
  }

  public async getMany<Value>(keys: string[]): Promise<Array<Value | undefined>> {
    return Promise.all(keys.map((key) => this.get<Value>(key)))
  }
  /**
   * Note: `await kv.set()` will wait <options.writeDelay> millseconds to save to disk, it would be slow. Please remove `await` if you find performance issues.
   * @param key
   * @param value
   * @param ttl
   * @returns
   */
  public async set(key: string, value: any, ttl?: number) {
    return idb.set(this._getKey(key), value, this.store)
  }

  public async delete(key: string) {
    let has = await this.has(key)
    await idb.del(this._getKey(key), this.store)
    return has
  }

  public async deleteMany(keys: string[]): Promise<boolean> {
    let res = await Promise.all(keys.map((key) => this.delete(key)))
    return res.every((r) => r)
  }

  public async clear() {
    // await idb.clear(this.store)
    let keys = await idb.keys(this.store)
    let tasks = [] as Promise<any>[]
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      if (typeof key === 'string' && key.startsWith(this.namespace)) {
        tasks.push(idb.del(key,this.store))
      }
    }
    await Promise.all(tasks)
  }

  public async has(key: string): Promise<boolean> {
    const value = await this.get(key)
    return value !== undefined
  }

  public disconnect(): Promise<void> {
    return Promise.resolve()
  }

  public async *iterator(namespace = this.namespace) {
    let keys = await idb.keys(this.store)

    for (let i = 0; i < keys.length; i++) {
      let key = keys[i]
      if (typeof key === 'string' && (!namespace || key.startsWith(namespace))) {
          yield[key, await idb.get(key, this.store)]
      }
    }
  }
}

export default KeyvIndexedDB
