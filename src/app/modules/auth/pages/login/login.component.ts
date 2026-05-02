import { ChangeDetectionStrategy, Component, computed, inject, Signal, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DEFAULT_ROUTE_SEGMENT, ROUTE_PATHS } from '@core/constants/app-routes';
import { SessionProvider } from '@core/providers/session.provider';
import { AuthFormBase } from '@modules/auth/utils/auth-form-base';

type LoginForm = {
  email: FormControl<string>;
  password: FormControl<string>;
};

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent extends AuthFormBase {
  private readonly sessionProvider = inject(SessionProvider);
  private readonly router = inject(Router);

  protected readonly registerLink: string = ROUTE_PATHS.authRegister;

  protected readonly emailControl: FormControl<string> = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });

  protected readonly passwordControl: FormControl<string> = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(6)],
  });

  protected readonly loginForm: FormGroup<LoginForm> = new FormGroup<LoginForm>({
    email: this.emailControl,
    password: this.passwordControl,
  });

  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly isMagicLinkLoading = signal<boolean>(false);
  protected readonly isResettingPassword = signal<boolean>(false);

  protected readonly isLoading: Signal<boolean> = computed<boolean>(
    () => this.isSubmitting() || this.isMagicLinkLoading() || this.isResettingPassword(),
  );

  protected async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    this.feedback.set(null);
    try {
      await this.sessionProvider.signInWithPassword({
        email: this.emailControl.value.trim(),
        password: this.passwordControl.value,
      });
      this.passwordControl.reset();
      void this.router.navigate([`/${DEFAULT_ROUTE_SEGMENT}`]);
    } catch (error) {
      this.feedback.set({
        kind: 'error',
        message: this.resolveErrorMessage(error, this.translationKeys.errors.invalidCredentials),
      });
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected async onMagicLink(): Promise<void> {
    const email = this.emailControl.value.trim();
    if (this.emailControl.invalid || email.length === 0) {
      this.emailControl.markAsTouched();
      this.feedback.set({
        kind: 'error',
        message: this.translationService.instant(this.translationKeys.errors.emailRequired),
      });
      return;
    }
    this.isMagicLinkLoading.set(true);
    this.feedback.set(null);
    try {
      await this.sessionProvider.signInWithMagicLink(email, window.location.origin);
      this.feedback.set({
        kind: 'info',
        message: this.translationService.instant(this.translationKeys.feedback.magicLinkSent),
      });
    } catch (error) {
      this.feedback.set({
        kind: 'error',
        message: this.resolveErrorMessage(error, this.translationKeys.errors.unexpected),
      });
    } finally {
      this.isMagicLinkLoading.set(false);
    }
  }

  protected async onResetPassword(): Promise<void> {
    if (this.isResettingPassword()) {
      return;
    }
    const email = this.emailControl.value.trim();
    if (this.emailControl.invalid || email.length === 0) {
      this.emailControl.markAsTouched();
      this.feedback.set({
        kind: 'error',
        message: this.translationService.instant(this.translationKeys.errors.emailRequired),
      });
      return;
    }
    this.isResettingPassword.set(true);
    this.feedback.set(null);
    try {
      const redirectTo = `${window.location.origin}${ROUTE_PATHS.authPasswordReset}`;
      await this.sessionProvider.sendPasswordResetEmail(email, redirectTo);
      this.feedback.set({
        kind: 'info',
        message: this.translationService.instant(this.translationKeys.feedback.passwordResetSent),
      });
    } catch (error) {
      this.feedback.set({
        kind: 'error',
        message: this.resolveErrorMessage(error, this.translationKeys.errors.unexpected),
      });
    } finally {
      this.isResettingPassword.set(false);
    }
  }
}
