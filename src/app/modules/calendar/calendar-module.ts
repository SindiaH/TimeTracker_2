import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { CalendarRoutingModule } from './calendar-routing-module';

@NgModule({
  imports: [SharedModule, CalendarRoutingModule],
})
export class CalendarModule {}
