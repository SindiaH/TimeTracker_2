import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { BaseComponentsModule } from '@shared/base-components/base-components.module';
import { MaterialComponentsModule } from '@shared/material-components/material-components.module';
import { AppShellComponent } from '@shared/components/app-shell/app-shell.component';
import { SharedHeaderComponent } from '@shared/components/shared-header/shared-header.component';
import { ModuleStubComponent } from '@shared/components/module-stub/module-stub.component';
import { SideMenuComponent } from '@shared/components/side-menu/side-menu.component';
import { FormatDurationPipe } from '@shared/pipes/format-duration.pipe';
import { SearchFilterPipe } from '@shared/pipes/search-filter.pipe';

const COMPONENTS = [AppShellComponent, SharedHeaderComponent, ModuleStubComponent, SideMenuComponent];
const PIPES = [FormatDurationPipe, SearchFilterPipe];

@NgModule({
  declarations: [...COMPONENTS, ...PIPES],
  imports: [CommonModule, TranslatePipe, BaseComponentsModule, MaterialComponentsModule],
  exports: [...COMPONENTS, ...PIPES, CommonModule, TranslatePipe, BaseComponentsModule],
})
export class SharedModule {}
