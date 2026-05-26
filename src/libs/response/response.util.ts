export interface PaginatedResponse<T> {
  data: T[];
  metadata: {
    pagination: {
      currentPage: number;
      pageSize: number;
      totalPages: number;
      totalItems: number;
    };
    sort: {
      sortBy: string;
      sortOrder: string;
    };
    filters: Record<string, string>;
  };
}

export interface CommonResponse<T> {
  error: boolean;
  message: string;
  body: T;
}

export class ResponseWrapper {
  static from<T = any>(
    body: T,
    error: boolean = false,
    message: string = 'OK',
  ): CommonResponse<T> {
    return {
      error,
      message,
      body,
    };
  }
}
