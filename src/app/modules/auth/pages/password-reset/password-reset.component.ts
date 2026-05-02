import { ChangeDetectionStrategy, Component, computed, inject, Signal, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DEFAULT_ROUTE_SEGMENT, ROUTE_PATHS } from '@core/constants/app-routes';
import { SessionProvider } from '@core/providers/session.provider';
import { AuthFormBase } from '@modules/auth/utils/auth-form-base';
import { matchControlValidator } from '@modules/auth/utils/match-control.validator';

type PasswordResetForm = {
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
};

type RecoveryTokens = {
  accessToken: string;
  refreshToken: string;
};

@Component({
  selector: 'app-password-reset',
  standalone: false,
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordResetComponent extends AuthFormBase {
  private readonly sessionProvider = inject(SessionProvider);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly loginLink: string = ROUTE_PATHS.authLogin;

  protected readonly passwordControl: FormControl<string> = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(6)],
  });

  protected readonly confirmPasswordControl: FormControl<string> = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, matchControlValidator('password')],
  });

  protected readonly resetForm: FormGroup<PasswordResetForm> = new FormGroup<PasswordResetForm>({
    password: this.passwordControl,
    confirmPassword: this.confirmPasswordControl,
  });

  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly isInitializing = signal<boolean>(true);

  protected readonly canResetPassword: Signal<boolean> = computed<boolean>(
    () => this.sessionProvider.isPasswordRecovery() || this.sessionProvider.isAuthenticated(),
  );

  constructor() {
    super();
    this.passwordControl.valueChanges.pipe(this.takeUntilDestroyed()).subscribe(() => {
      this.confirmPasswordControl.updateValueAndValidity();
    });
    void this.consumeRecoveryTokens();
  }

  protected async onSubmit(): Promise<void> {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }
    if (!this.canResetPassword()) {
      this.feedback.set({
        kind: 'error',
        message: this.translationService.instant(this.translationKeys.errors.recoveryLinkInvalid),
      });
      return;
    }
    this.isSubmitting.set(true);
    this.feedback.set(null);
    try {
      await this.sessionProvider.updatePassword(this.passwordControl.value);
      this.feedback.set({
        kind: 'success',
        message: this.translationService.instant(this.translationKeys.feedback.passwordUpdated),
      });
      this.resetForm.reset();
      void this.router.navigate([`/${DEFAULT_ROUTE_SEGMENT}`]);
    } catch (error) {
      this.feedback.set({
        kind: 'error',
        message: this.resolveErrorMessage(error, this.translationKeys.errors.unexpected),
      });
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private async consumeRecoveryTokens(): Promise<void> {
    const fragment = await this.firstValueFromFragment();
    const tokens = this.parseTokenFragment(fragment);
    if (!tokens) {
      this.isInitializing.set(false);
      return;
    }
    try {
      await this.sessionProvider.setSessionFromTokens(tokens.accessToken, tokens.refreshToken);
    } catch (error) {
      this.feedback.set({
        kind: 'error',
        message: this.resolveErrorMessage(error, this.translationKeys.errors.recoveryLinkInvalid),
      });
    } finally {
      this.isInitializing.set(false);
    }
  }

  private firstValueFromFragment(): Promise<string | null> {
    return new Promise<string | null>((resolve) => {
      const subscription = this.route.fragment.pipe(this.takeUntilDestroyed()).subscribe((fragment) => {
        subscription.unsubscribe();
        resolve(fragment);
      });
    });
  }

  private parseTokenFragment(fragment: string | null): RecoveryTokens | null {
    if (!fragment) {
      return null;
    }
    const params = new URLSearchParams(fragment);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    if (!accessToken || !refreshToken) {
      return null;
    }
    return { accessToken, refreshToken };
  }
}
