type Option = {
  cache: boolean;
};

export class Cache {
  private cache = new Map();
  private option: Option = { cache: true };

  load<X>(key: string, value: () => X): X {
    if (!this.option.cache) return value();
    const getCache = this.cache.get(key);
    if (getCache !== undefined) {
      return getCache;
    } else {
      const getValue = value();
      this.cache.set(key, getValue);
      return getValue;
    }
  }

  setOptions(_option: Partial<Option>) {
    Object.assign(this.option, _option);
  }

  size(): number {
    return this.cache.size;
  }
}
