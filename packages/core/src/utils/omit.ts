export const omit = <T, S extends keyof T>(object: T, keys: S[]) => {
  const clone = Object.assign({}, object);
  for (const key of keys) {
    if (key in clone) delete clone[key];
  }
  return clone;
};
