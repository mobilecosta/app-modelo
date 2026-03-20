export interface PaginationParams {
  page: number;
  pageSize: number;
  from: number;
  to: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

export const getPaginationParams = (query: Record<string, unknown>): PaginationParams => {
  const rawPage = Number(query.page);
  const rawPageSize = Number(query.pageSize);

  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : DEFAULT_PAGE;
  const pageSize = Number.isInteger(rawPageSize) && rawPageSize > 0
    ? Math.min(rawPageSize, MAX_PAGE_SIZE)
    : DEFAULT_PAGE_SIZE;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return { page, pageSize, from, to };
};

export const getHasNextPage = (page: number, pageSize: number, total: number): boolean => {
  return page * pageSize < total;
};
