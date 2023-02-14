export type ValueOf<T> = T[keyof T];
export type ArrayOr<T> = T | T[];

export type Prettify<T> = {
  [P in keyof T]: T[P];
};

export type NonNullable<T> = T extends undefined | null ? never : T;

type UnionToIntersection<U> = (
  U extends unknown ? (_: U) => void : never
) extends (_: infer I) => void
  ? I
  : never;

export type FirstChar<T> = T extends `${infer X}${infer _}` ? X : never;

export type IncludeString<T extends ArrayOr<string>> = T extends string
  ? `${string}${T}${string}`
  : UnionToIntersection<`${string}${T[number]}${string}`>;
