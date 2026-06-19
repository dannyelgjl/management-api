import { buildPaginationMeta } from './pagination';

describe('buildPaginationMeta', () => {
  it('marks hasNext when there are more records after the current page', () => {
    expect(buildPaginationMeta(11, 10, 0)).toEqual({
      total: 11,
      limit: 10,
      offset: 0,
      hasNext: true,
    });
  });

  it('marks hasNext as false on the last page', () => {
    expect(buildPaginationMeta(10, 10, 0)).toEqual({
      total: 10,
      limit: 10,
      offset: 0,
      hasNext: false,
    });
  });
});
