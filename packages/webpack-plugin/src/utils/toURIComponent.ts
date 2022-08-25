export const toURIComponent = (rule: string): string => {
  return encodeURIComponent(rule).replace(/!/g, '%21');
};
