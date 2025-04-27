export type PaginatedResource<T> = {
  totalItems: number;
  items: T[];
  page: number;
  size: number;
};