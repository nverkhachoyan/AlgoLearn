export type Response = {
  success?: boolean;
  message?: string;
  data?: JSON | PaginatedResponse;
  error?: string;
  errorCode?: string;
};

export interface PaginatedResponse {
  items: any;
  total: number;
  pageSize: number;
  page: number;
  totalPages: number;
}
