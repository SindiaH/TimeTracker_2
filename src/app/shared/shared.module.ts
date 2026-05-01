import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { BaseComponentsModule } from '@shared/base-components/base-components.module';
import { MaterialComponentsModule } from '@shared/material-components/material-components.module';
import { SharedHeaderComponent } from '@shared/components/shared-header/shared-header.component';
import { ModuleStubComponent } from '@shared/components/module-stub/module-stub.component';
import { SideMenuComponent } from '@shared/components/side-menu/side-menu.component';
import { SearchFilterPipe } from '@shared/pipes/search-filter.pipe';

const COMPONENTS = [SharedHeaderComponent, ModuleStubComponent, SideMenuComponent];
const PIPES = [SearchFilterPipe];

@NgModule({
  declarations: [...COMPONENTS, ...PIPES],
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, BaseComponentsModule, MaterialComponentsModule],
  exports: [
    ...COMPONENTS,
    ...PIPES,
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    BaseComponentsModule,
    MaterialComponentsModule,
  ],
})
export class SharedModule {}
