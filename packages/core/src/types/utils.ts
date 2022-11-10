export type ValueOf<T> = T[keyof T];
export type AndArray<T> = T | T[];
export type ObjKey = string | number | symbol;
export type NestedObj<T> = {
  [_ in ObjKey]?: NestedObj<T> | T;
};

type UnionToIntersection<U> = (
  U extends unknown ? (_: U) => void : never
) extends (_: infer I) => void
  ? I
  : never;

export type IncludeStr<T extends AndArray<string>> = T extends string
  ? `${string}${T}${string}`
  : UnionToIntersection<`${string}${T[number]}${string}`>;
