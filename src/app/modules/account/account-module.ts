import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { AccountRoutingModule } from './account-routing-module';
import { AccountComponent } from './pages/account/account.component';

@NgModule({
  declarations: [AccountComponent],
  imports: [SharedModule, AccountRoutingModule],
})
export class AccountModule {}
