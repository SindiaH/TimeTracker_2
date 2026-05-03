import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceBase } from '@core/base/service-base';
import { ROUTE_PATHS } from '@core/constants/app-routes';
import { SessionProvider } from '@core/providers/session.provider';

@Injectable({ providedIn: 'root' })
export class AuthActionsService extends ServiceBase {
  private readonly sessionProvider = inject(SessionProvider);
  private readonly router = inject(Router);

  async signOutAndRedirect(): Promise<void> {
    await this.sessionProvider.signOut();
    await this.router.navigateByUrl(ROUTE_PATHS.authLogin);
  }
}
