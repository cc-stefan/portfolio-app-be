export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationMetadata extends PaginationParams {
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMetadata;
}

export function resolvePagination(
  page: number | undefined,
  pageSize: number | undefined,
  defaultPageSize: number,
): PaginationParams | null {
  if (page === undefined && pageSize === undefined) {
    return null;
  }

  return {
    page: page ?? 1,
    pageSize: pageSize ?? defaultPageSize,
  };
}

export function createPaginationMetadata(
  pagination: PaginationParams,
  totalItems: number,
): PaginationMetadata {
  return {
    ...pagination,
    totalItems,
    totalPages: Math.ceil(totalItems / pagination.pageSize),
  };
}

export function getPaginationDatabaseArgs(pagination: PaginationParams) {
  return {
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize,
  };
}
