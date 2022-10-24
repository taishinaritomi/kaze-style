export const normalizeShorthandProperty = <T extends string>(
  property: `$${T}`,
): T => {
  return (property.charAt(0) === '$' ? property.slice(1) : property) as T;
};
