export type ValueOf<T> = T[keyof T];
export type AndArray<T> = T | T[];
export type IncludeChar<T extends string> = `${string}${T}${string}`;

export type NestedObj<T> = Obj<T>;
type Obj<T = string> = {
  [_ in string]?: NestedObj<T> | T;
};
