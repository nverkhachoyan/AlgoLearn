// src/types/routes.ts
export type AppRoutes =
  | '/'
  | '/welcome'
  | '/profile'
  | '/settings'
  | '/ModuleSession'
  | `/CourseDetails/?courseID=${string}`;

export type DynamicRouteParams = {
  '/CourseDetails': { courseID: string };
};

export type RouteParams<T extends keyof DynamicRouteParams> =
  DynamicRouteParams[T];
