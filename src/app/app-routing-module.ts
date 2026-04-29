import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'tasks',
  },
  {
    path: 'auth',
    loadChildren: () => import('@modules/auth/auth-module').then((m) => m.AuthModule),
  },
  {
    path: 'tasks',
    loadChildren: () => import('@modules/tasks/tasks-module').then((m) => m.TasksModule),
  },
  {
    path: 'time-entries',
    loadChildren: () => import('@modules/time-entries/time-entries-module').then((m) => m.TimeEntriesModule),
  },
  {
    path: 'calendar',
    loadChildren: () => import('@modules/calendar/calendar-module').then((m) => m.CalendarModule),
  },
  {
    path: 'activities',
    loadChildren: () => import('@modules/activities/activities-module').then((m) => m.ActivitiesModule),
  },
  {
    path: 'settings',
    loadChildren: () => import('@modules/settings/settings-module').then((m) => m.SettingsModule),
  },
  {
    path: '**',
    redirectTo: 'tasks',
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
