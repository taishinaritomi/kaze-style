export const normalizeNestedSelector = (
  current: string,
  nested: string,
): string => {
  let selector = current;
  if (current) {
    selector += nested.charAt(0) === '&' ? nested.slice(1) : nested;
  } else {
    selector = nested.includes('&') ? nested : '&' + nested;
  }
  return selector;
};
