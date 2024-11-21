export interface UseProgressParams {
    user_id?: number;
    course_id?: number;
    page?: number;
    pageSize?: number;
    filter?: 'learning' | 'explore' | 'all';
    type?: 'summary' | 'brief' | 'full';
  }