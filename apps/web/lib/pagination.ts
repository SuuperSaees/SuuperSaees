export namespace Pagination {
  export type Request = {
    page?: number;
    limit?: number;
    cursor?: string;
  };

  export type Response<T> = {
    data: T[] | null;
    total: number | null;
    limit: number | null;
    page: number | null;
    nextCursor?: string | null;
    prevCursor?: string | null;
  };
}
