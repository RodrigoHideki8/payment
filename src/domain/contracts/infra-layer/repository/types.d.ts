export interface PaginatedList<TEntity> {
  docs: TEntity[];
  size: number;
  hasNext: boolean;
  page: number;
  limit: number;
}
