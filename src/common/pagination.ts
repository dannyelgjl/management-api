export function buildPaginationMeta(total: number, limit: number, offset: number) {
  return {
    total,
    limit,
    offset,
    hasNext: offset + limit < total,
  };
}
