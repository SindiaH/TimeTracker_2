import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ExtendedRoutes } from '@core/routing/extended-routes';
import { DesktopDebugComponent } from './components/desktop-debug/desktop-debug.component';

const routes: ExtendedRoutes = [
  {
    path: '',
    component: DesktopDebugComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {}
