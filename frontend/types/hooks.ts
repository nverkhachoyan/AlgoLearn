export interface UseProgressParams {
    user_id: number;
    page: number;
    pageSize: number;
    filter: 'learning' | 'explore';
    type?: 'summary' | 'brief' | 'full';
  }