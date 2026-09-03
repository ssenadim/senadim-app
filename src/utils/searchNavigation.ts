export function getAdjacentResultIndex(
  currentIndex: number,
  resultCount: number,
  direction: 1 | -1,
): number {
  if (resultCount <= 0) {
    return -1;
  }

  if (currentIndex < 0) {
    return direction === 1 ? 0 : resultCount - 1;
  }

  return (currentIndex + direction + resultCount) % resultCount;
}
