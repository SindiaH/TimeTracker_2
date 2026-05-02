import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AUTH_ROUTE_SEGMENTS, ROUTE_SEGMENTS } from '@core/constants/app-routes';
import { RedirectIfAuthenticatedGuard } from '@core/guards/redirect-if-authenticated.guard';
import { ExtendedRoutes } from '@core/routing/extended-routes';
import { LoginComponent } from './pages/login/login.component';
import { PasswordResetComponent } from './pages/password-reset/password-reset.component';
import { RegisterComponent } from './pages/register/register.component';

const routes: ExtendedRoutes = [
  {
    path: ROUTE_SEGMENTS.empty,
    pathMatch: 'full',
    redirectTo: AUTH_ROUTE_SEGMENTS.login,
  },
  {
    path: AUTH_ROUTE_SEGMENTS.login,
    component: LoginComponent,
    canActivate: [RedirectIfAuthenticatedGuard],
  },
  {
    path: AUTH_ROUTE_SEGMENTS.register,
    component: RegisterComponent,
    canActivate: [RedirectIfAuthenticatedGuard],
  },
  {
    path: AUTH_ROUTE_SEGMENTS.passwordReset,
    component: PasswordResetComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
