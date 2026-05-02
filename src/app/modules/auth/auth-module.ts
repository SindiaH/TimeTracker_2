import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { AuthRoutingModule } from './auth-routing-module';
import { AuthLayoutComponent } from './components/auth-layout/auth-layout.component';
import { LoginComponent } from './pages/login/login.component';
import { PasswordResetComponent } from './pages/password-reset/password-reset.component';
import { RegisterComponent } from './pages/register/register.component';

@NgModule({
  declarations: [AuthLayoutComponent, LoginComponent, RegisterComponent, PasswordResetComponent],
  imports: [SharedModule, AuthRoutingModule],
})
export class AuthModule {}
