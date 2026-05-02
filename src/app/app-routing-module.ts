import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DEFAULT_ROUTE_SEGMENT, ROUTE_SEGMENTS } from '@core/constants/app-routes';
import { AutoLoginRoutesGuard } from '@core/guards/auto-login-routes.guard';
import { ExtendedRoutes } from '@core/routing/extended-routes';

const routes: ExtendedRoutes = [
  {
    path: ROUTE_SEGMENTS.empty,
    pathMatch: 'full',
    redirectTo: DEFAULT_ROUTE_SEGMENT,
  },
  {
    path: ROUTE_SEGMENTS.auth,
    loadChildren: () => import('@modules/auth/auth-module').then((m) => m.AuthModule),
  },
  {
    path: ROUTE_SEGMENTS.tasks,
    canActivate: [AutoLoginRoutesGuard],
    loadChildren: () => import('@modules/tasks/tasks-module').then((m) => m.TasksModule),
  },
  {
    path: ROUTE_SEGMENTS.timeEntries,
    canActivate: [AutoLoginRoutesGuard],
    loadChildren: () => import('@modules/time-entries/time-entries-module').then((m) => m.TimeEntriesModule),
  },
  {
    path: ROUTE_SEGMENTS.calendar,
    canActivate: [AutoLoginRoutesGuard],
    loadChildren: () => import('@modules/calendar/calendar-module').then((m) => m.CalendarModule),
  },
  {
    path: ROUTE_SEGMENTS.activities,
    canActivate: [AutoLoginRoutesGuard],
    loadChildren: () => import('@modules/activities/activities-module').then((m) => m.ActivitiesModule),
  },
  {
    path: ROUTE_SEGMENTS.settings,
    canActivate: [AutoLoginRoutesGuard],
    loadChildren: () => import('@modules/settings/settings-module').then((m) => m.SettingsModule),
  },
  {
    path: ROUTE_SEGMENTS.account,
    canActivate: [AutoLoginRoutesGuard],
    loadChildren: () => import('@modules/account/account-module').then((m) => m.AccountModule),
  },
  {
    path: ROUTE_SEGMENTS.showcase,
    loadChildren: () => import('@modules/showcase/showcase-module').then((m) => m.ShowcaseModule),
  },
  {
    path: ROUTE_SEGMENTS.wildcard,
    redirectTo: DEFAULT_ROUTE_SEGMENT,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      anchorScrolling: 'enabled',
      scrollPositionRestoration: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
