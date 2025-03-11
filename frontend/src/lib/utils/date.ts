export const humanReadableDate = (createdAtTimestamp: string) => {
  const date = new Date(createdAtTimestamp);

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
