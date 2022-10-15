export type ValueOf<T> = T[keyof T];
export type AndArray<T> = T | T[];
export type IncludeChar<T extends string> = `${string}${T}${string}`;
export type TrimPrefix<
  S extends string,
  P extends string,
> = S extends `${P}${infer E}` ? E : S;
