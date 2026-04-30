import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { DesktopDebugComponent } from './components/desktop-debug/desktop-debug.component';
import { SettingsRoutingModule } from './settings-routing-module';

@NgModule({
  declarations: [DesktopDebugComponent],
  imports: [CommonModule, SharedModule, SettingsRoutingModule],
})
export class SettingsModule {}
