'use strict'

import type { IEventEmitter, Keyv, KeyvStoreAdapter, StoredData } from 'keyv'

export interface Options {
  deserialize: (val: string) => any
  dialect: string
  serialize: (val: any) => string
  namespace?: string
}

export const defaultOpts: Options = {
  deserialize: JSON.parse,
  dialect: 'redis',
  serialize: JSON.stringify,
}

export class KeyvLocalStorage implements KeyvStoreAdapter {
  public ttlSupport = false
  public namespace = ''
  public opts: Options

  constructor(options?: Partial<Options>) {
    this.opts = Object.assign({}, defaultOpts, options)
    if (this.opts.namespace) {
      this.namespace = this.opts.namespace
    }
  }
  on(event: string, listener: (...arguments_: any[]) => void): IEventEmitter {
    // throw new Error('Method not implemented.')
    return this
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

  public async get<Value>(key: string): Promise<Value | undefined> {
    return this.getSync(key)
  }

  public getSync<Value>(key: string): Value | undefined {
    try {
      const data = localStorage.getItem(this._getKey(key))
      if (data == null) {
        return
      }
      return JSON.parse(data)
    } catch (error) {
      // do nothing;
    }
  }

  public async getMany<Value>(keys: string[]): Promise<Array<StoredData<Value | undefined>>> {
    return keys.map((key) => this.getSync(key))
  }
  /**
   * Note: `await kv.set()` will wait <options.writeDelay> millseconds to save to disk, it would be slow. Please remove `await` if you find performance issues.
   * @param key
   * @param value
   * @param ttl
   * @returns
   */
  public async set(key: string, value: any, ttl?: number) {
    if (ttl === 0) {
      ttl = undefined
    }
    localStorage.setItem(this._getKey(key), JSON.stringify(value))
  }

  public async delete(key: string) {
    if (this.hasSync(key)) {
      localStorage.removeItem(this._getKey(key))
      return true
    }
    return false
  }

  public async deleteMany(keys: string[]): Promise<boolean> {
    let res = await Promise.all(keys.map((key) => this.delete(key)))
    return res.every(f=>f)
  }

  public async clear() {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.namespace)) {
        localStorage.removeItem(key)
      }
    }
  }

  public async has(key: string): Promise<boolean> {
    const value = this.getSync(key)
    return value !== undefined
  }

  public hasSync(key: string): boolean {
    const value = this.getSync(key)
    return value !== undefined
  }

  public disconnect(): Promise<void> {
    return Promise.resolve()
  }

  public async *iterator(namespace = this.namespace) {
    for (let i = 0; i < localStorage.length; i++) {
      let key = localStorage.key(i)
      if (key) {
        if (!namespace || key.startsWith(namespace)) {
          key = this._innerKeyToKey(key)
          yield [key, this.getSync<any>(key)]
        }
      }
    }
  }
}

export default KeyvLocalStorage
