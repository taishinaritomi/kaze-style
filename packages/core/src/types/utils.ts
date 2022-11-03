export type ValueOf<T> = T[keyof T];
export type AndArray<T> = T | T[];
export type IncludeChar<T extends string> = `${string}${T}${string}`;
export type ObjKey = string | number | symbol;
export type NestedObj<T> = {
  [_ in ObjKey]?: NestedObj<T> | T;
};
