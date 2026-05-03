import { computed, inject, Injectable, Signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';
import { filter, map, Observable, take } from 'rxjs';
import { ROUTE_PATHS } from '@core/constants/app-routes';
import { SessionProvider } from '@core/providers/session.provider';

type SessionGate = {
  isReady: boolean;
  isAuthenticated: boolean;
};

@Injectable({ providedIn: 'root' })
export class AuthenticatedGuard implements CanActivate, CanActivateChild {
  private readonly sessionProvider = inject(SessionProvider);
  private readonly router = inject(Router);

  private readonly gate: Signal<SessionGate> = computed<SessionGate>(() => ({
    isReady: !this.sessionProvider.isLoading(),
    isAuthenticated: this.sessionProvider.isAuthenticated(),
  }));

  private readonly gate$: Observable<SessionGate> = toObservable(this.gate);

  canActivate(): Observable<boolean | UrlTree> {
    return this.checkAuth();
  }

  canActivateChild(): Observable<boolean | UrlTree> {
    return this.checkAuth();
  }

  private checkAuth(): Observable<boolean | UrlTree> {
    return this.gate$.pipe(
      filter((gate) => gate.isReady),
      take(1),
      map((gate) => (gate.isAuthenticated ? true : this.router.parseUrl(ROUTE_PATHS.authLogin))),
    );
  }
}
