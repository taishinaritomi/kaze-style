import type { Any } from './types/any';

type Option = {
  cache: boolean;
};

export class Cache<T = unknown, K = string> {
  private cache = new Map<K, T>();
  private option: Option = { cache: true };

  load<X>(key: K, value: () => X): X {
    if (!this.option.cache) return value();
    const getCache = this.cache.get(key);
    if (getCache !== undefined) {
      return getCache as Any as X;
    } else {
      const getValue = value();
      this.set(key, getValue as Any as T);
      return getValue;
    }
  }

  setOptions(_option: Partial<Option>) {
    Object.assign(this.option, _option);
  }

  set(key: K, value: T): Map<K, T> {
    return this.cache.set(key, value);
  }

  remove(key: K): boolean {
    return this.cache.delete(key);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  get(key: K): T | undefined {
    return this.cache.get(key);
  }

  size(): number {
    return this.cache.size;
  }

  forEach(callback: (key: K, value: T) => void) {
    this.cache.forEach((value, key) => callback(key, value));
  }

  getAll(): Record<string, T> {
    return Object.fromEntries(this.cache);
  }

  getKeys(): K[] {
    return Array.from(this.cache.keys());
  }

  getValues(): T[] {
    return Array.from(this.cache.values());
  }
}
