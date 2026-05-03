import { computed, inject, Injectable, Signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { filter, map, Observable, take } from 'rxjs';
import { AUTH_ROUTE_SEGMENTS, DEFAULT_ROUTE_SEGMENT } from '@core/constants/app-routes';
import { SessionProvider } from '@core/providers/session.provider';

type SessionGate = {
  isReady: boolean;
  isAuthenticated: boolean;
  isPasswordRecovery: boolean;
};

@Injectable({ providedIn: 'root' })
export class RedirectIfAuthenticatedGuard implements CanActivate {
  private readonly sessionProvider = inject(SessionProvider);
  private readonly router = inject(Router);

  private readonly gate: Signal<SessionGate> = computed<SessionGate>(() => ({
    isReady: !this.sessionProvider.isLoading(),
    isAuthenticated: this.sessionProvider.isAuthenticated(),
    isPasswordRecovery: this.sessionProvider.isPasswordRecovery(),
  }));

  private readonly gate$: Observable<SessionGate> = toObservable(this.gate);

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const isPasswordResetRoute = route.routeConfig?.path === AUTH_ROUTE_SEGMENTS.passwordReset;
    return this.gate$.pipe(
      filter((gate) => gate.isReady),
      take(1),
      map((gate) => {
        if (!gate.isAuthenticated) {
          return true;
        }
        if (gate.isPasswordRecovery && isPasswordResetRoute) {
          return true;
        }
        return this.router.parseUrl(`/${DEFAULT_ROUTE_SEGMENT}`);
      }),
    );
  }
}
