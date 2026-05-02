export const ROUTE_SEGMENTS = {
  empty: '',
  wildcard: '**',
  auth: 'auth',
  tasks: 'tasks',
  timeEntries: 'time-entries',
  calendar: 'calendar',
  activities: 'activities',
  settings: 'settings',
  account: 'account',
  showcase: 'showcase',
} as const;

export type RouteSegment = (typeof ROUTE_SEGMENTS)[keyof typeof ROUTE_SEGMENTS];

export const AUTH_ROUTE_SEGMENTS = {
  login: 'login',
  register: 'register',
  passwordReset: 'password-reset',
} as const;

export type AuthRouteSegment = (typeof AUTH_ROUTE_SEGMENTS)[keyof typeof AUTH_ROUTE_SEGMENTS];

export const ROUTE_PATHS = {
  auth: `/${ROUTE_SEGMENTS.auth}`,
  authLogin: `/${ROUTE_SEGMENTS.auth}/${AUTH_ROUTE_SEGMENTS.login}`,
  authRegister: `/${ROUTE_SEGMENTS.auth}/${AUTH_ROUTE_SEGMENTS.register}`,
  authPasswordReset: `/${ROUTE_SEGMENTS.auth}/${AUTH_ROUTE_SEGMENTS.passwordReset}`,
  tasks: `/${ROUTE_SEGMENTS.tasks}`,
  timeEntries: `/${ROUTE_SEGMENTS.timeEntries}`,
  calendar: `/${ROUTE_SEGMENTS.calendar}`,
  activities: `/${ROUTE_SEGMENTS.activities}`,
  settings: `/${ROUTE_SEGMENTS.settings}`,
  account: `/${ROUTE_SEGMENTS.account}`,
  showcase: `/${ROUTE_SEGMENTS.showcase}`,
} as const;

export type RoutePath = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS];

export const DEFAULT_ROUTE_SEGMENT: RouteSegment = ROUTE_SEGMENTS.tasks;
