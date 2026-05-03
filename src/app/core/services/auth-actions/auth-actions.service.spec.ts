import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { ROUTE_PATHS } from '@core/constants/app-routes';
import { SessionProvider } from '@core/providers/session.provider';
import { AuthActionsService } from '@core/services/auth-actions/auth-actions.service';
import { createRouterStub } from '@testing/stubs/angular.stubs';

describe('AuthActionsService', () => {
  let signOut: ReturnType<typeof vi.fn>;
  let router: ReturnType<typeof createRouterStub>;

  beforeEach(() => {
    signOut = vi.fn().mockResolvedValue(undefined);
    router = createRouterStub();

    TestBed.configureTestingModule({
      providers: [
        { provide: SessionProvider, useValue: { signOut } },
        { provide: Router, useValue: router },
        AuthActionsService,
      ],
    });
  });

  it('signs out via SessionProvider, then navigates to the login route', async () => {
    const service = TestBed.inject(AuthActionsService);

    await service.signOutAndRedirect();

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(router.navigateByUrl).toHaveBeenCalledWith(ROUTE_PATHS.authLogin);
  });

  it('does not navigate if signOut throws', async () => {
    const failure = new Error('signout failed');
    signOut.mockRejectedValueOnce(failure);
    const service = TestBed.inject(AuthActionsService);

    await expect(service.signOutAndRedirect()).rejects.toBe(failure);

    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
