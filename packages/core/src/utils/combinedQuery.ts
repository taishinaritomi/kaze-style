export const combinedQuery = (
  currentQuery: string,
  nestedQuery: string,
): string => {
  if (currentQuery.length === 0) {
    return nestedQuery;
  }
  return `${currentQuery} and ${nestedQuery}`;
};
