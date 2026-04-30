import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DesktopDebugComponent } from './components/desktop-debug/desktop-debug.component';

const routes: Routes = [
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
