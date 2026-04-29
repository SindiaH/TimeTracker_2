import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseComponentsModule } from '@shared/base-components/base-components.module';
import { MaterialComponentsModule } from '@shared/material-components/material-components.module';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, BaseComponentsModule, MaterialComponentsModule],
  exports: [CommonModule, ReactiveFormsModule, BaseComponentsModule, MaterialComponentsModule],
})
export class SharedModule {}
