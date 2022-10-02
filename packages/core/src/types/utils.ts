export type ValueOf<T> = T[keyof T];
export type AndArray<T> = T | T[];
export type NestedObject<T> = T | { [_: string]: T };
export type TrimPrefix<
  S extends string,
  P extends string,
> = S extends `${P}${infer E}` ? E : S;
