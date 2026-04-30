export const ROUTE_SEGMENTS = {
  empty: '',
  wildcard: '**',
  auth: 'auth',
  tasks: 'tasks',
  timeEntries: 'time-entries',
  calendar: 'calendar',
  activities: 'activities',
  settings: 'settings',
} as const;

export type RouteSegment = (typeof ROUTE_SEGMENTS)[keyof typeof ROUTE_SEGMENTS];

export const ROUTE_PATHS = {
  auth: `/${ROUTE_SEGMENTS.auth}`,
  tasks: `/${ROUTE_SEGMENTS.tasks}`,
  timeEntries: `/${ROUTE_SEGMENTS.timeEntries}`,
  calendar: `/${ROUTE_SEGMENTS.calendar}`,
  activities: `/${ROUTE_SEGMENTS.activities}`,
  settings: `/${ROUTE_SEGMENTS.settings}`,
} as const;

export type RoutePath = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS];

export const DEFAULT_ROUTE_SEGMENT: RouteSegment = ROUTE_SEGMENTS.tasks;
