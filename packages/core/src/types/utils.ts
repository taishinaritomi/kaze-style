export type ValueOf<T> = T[keyof T];
export type AndArray<T> = T | T[];

type UnionToIntersection<U> = (
  U extends unknown ? (_: U) => void : never
) extends (_: infer I) => void
  ? I
  : never;

export type FirstChar<T> = T extends `${infer X}${infer _}` ? X : never;

export type IncludeString<T extends AndArray<string>> = T extends string
  ? `${string}${T}${string}`
  : UnionToIntersection<`${string}${T[number]}${string}`>;
