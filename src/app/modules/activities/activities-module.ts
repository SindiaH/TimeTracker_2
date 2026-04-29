import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { ActivitiesRoutingModule } from './activities-routing-module';

@NgModule({
  imports: [SharedModule, ActivitiesRoutingModule],
})
export class ActivitiesModule {}
