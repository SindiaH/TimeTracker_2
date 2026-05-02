import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ROUTE_SEGMENTS } from '@core/constants/app-routes';
import { ExtendedRoutes } from '@core/routing/extended-routes';
import { AccountComponent } from './pages/account/account.component';

const routes: ExtendedRoutes = [
  {
    path: ROUTE_SEGMENTS.empty,
    component: AccountComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountRoutingModule {}
