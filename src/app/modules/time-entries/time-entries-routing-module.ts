import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ModuleStubComponent } from '@shared/components/module-stub/module-stub.component';

const routes: Routes = [
  {
    path: '',
    component: ModuleStubComponent,
    data: { moduleName: 'Time Entries', translationKey: 'modules.stubMessage' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TimeEntriesRoutingModule {}
