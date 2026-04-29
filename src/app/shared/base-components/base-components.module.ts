import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialComponentsModule } from '@shared/material-components/material-components.module';
import { ButtonComponent } from '@shared/base-components/button/button.component';
import { IconComponent } from '@shared/base-components/icon/icon.component';

@NgModule({
  declarations: [ButtonComponent, IconComponent],
  imports: [CommonModule, MaterialComponentsModule],
  exports: [ButtonComponent, IconComponent],
})
export class BaseComponentsModule {}
