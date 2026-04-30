import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MODULE_DISPLAY_NAMES } from '@core/constants/module-display-names';
import { TRANSLATION_KEYS } from '@core/constants/translation-keys';
import { ExtendedRoutes } from '@core/routing/extended-routes';
import { ModuleStubComponent } from '@shared/components/module-stub/module-stub.component';

const routes: ExtendedRoutes = [
  {
    path: '',
    component: ModuleStubComponent,
    data: {
      moduleName: MODULE_DISPLAY_NAMES.auth,
      translationKey: TRANSLATION_KEYS.modules.stubMessage,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
