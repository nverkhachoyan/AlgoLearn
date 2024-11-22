export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  error?: {
    code: string;
    details?: string;
  };
  payload: T;
}

export interface PaginatedPayload<T> {
  items: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}
