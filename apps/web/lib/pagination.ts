export namespace Pagination {
  export type Request = {
    page?: number;
    limit?: number;
    cursor?: string | number;
  };

  export type Response<T> = {
    data: T[];
    total: number | null;
    limit: number | null;
    page: number | null;
    nextCursor?: string | number | null;
    prevCursor?: string | number | null;
  };
}
