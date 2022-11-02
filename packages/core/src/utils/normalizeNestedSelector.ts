type Args = {
  nested: string;
  current: string;
};

export const normalizeNestedSelector = ({ nested, current }: Args): string => {
  let selector = current;
  if (current) {
    selector += nested.charAt(0) === '&' ? nested.slice(1) : nested;
  } else {
    selector = nested.includes('&') ? nested : '&' + nested;
  }
  return selector;
};
