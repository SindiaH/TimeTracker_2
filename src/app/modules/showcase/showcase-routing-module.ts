import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ExtendedRoutes } from '@core/routing/extended-routes';
import { ShowcasePageComponent } from './showcase-page/showcase-page.component';

const routes: ExtendedRoutes = [
  {
    path: '',
    component: ShowcasePageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShowcaseRoutingModule {}
