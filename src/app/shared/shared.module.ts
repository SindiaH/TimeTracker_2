import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseComponentsModule } from '@shared/base-components/base-components.module';
import { MaterialComponentsModule } from '@shared/material-components/material-components.module';
import { SharedHeaderComponent } from '@shared/components/shared-header/shared-header.component';

const COMPONENTS = [SharedHeaderComponent];

@NgModule({
  declarations: COMPONENTS,
  imports: [CommonModule, ReactiveFormsModule, BaseComponentsModule, MaterialComponentsModule],
  exports: [...COMPONENTS, CommonModule, ReactiveFormsModule, BaseComponentsModule, MaterialComponentsModule],
})
export class SharedModule {}
