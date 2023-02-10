export const timer = () => {
  const now = Date.now();
  return () => Date.now() - now;
};
