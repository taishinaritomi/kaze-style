export const isNestSelector = (property: string): boolean => {
  return /(:|&| |,|>|~|\+|\[|\.|#|)/.test(property);
};
