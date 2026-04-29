import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { TimeEntriesRoutingModule } from './time-entries-routing-module';

@NgModule({
  imports: [SharedModule, TimeEntriesRoutingModule],
})
export class TimeEntriesModule {}
