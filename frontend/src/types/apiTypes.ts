export type Response = {
  success?: boolean;
  message?: string;
  data?: JSON | PaginatedResponse;
  error?: string;
  error_code?: string;
};

export interface PaginatedResponse {
  items: any;
  total: number;
  pageSize: number;
  page: number;
  total_pages: number;
}