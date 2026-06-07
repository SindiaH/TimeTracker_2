import { ChangeDetectionStrategy, Component, computed, inject, Signal, signal } from '@angular/core';
import { email, form, minLength, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { DEFAULT_ROUTE_SEGMENT, ROUTE_PATHS } from '@core/constants/app-routes';
import { PASSWORD_MIN_LENGTH } from '@core/constants/auth.constants';
import { SessionProvider } from '@core/providers/session.provider';
import { AuthFormBase } from '@modules/auth/utils/auth-form-base';

type LoginModel = {
  email: string;
  password: string;
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

  protected readonly model = signal<LoginModel>({ email: '', password: '' });

  protected readonly loginForm = form(this.model, (f) => {
    required(f.email);
    email(f.email);
    required(f.password);
    minLength(f.password, PASSWORD_MIN_LENGTH);
  });

  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly isMagicLinkLoading = signal<boolean>(false);
  protected readonly isResettingPassword = signal<boolean>(false);

  protected readonly isLoading: Signal<boolean> = computed<boolean>(
    () => this.isSubmitting() || this.isMagicLinkLoading() || this.isResettingPassword(),
  );

  protected readonly emailError: Signal<string | null> = computed<string | null>(() =>
    this.getEmailError(this.loginForm.email()),
  );
  protected readonly passwordError: Signal<string | null> = computed<string | null>(() =>
    this.getPasswordError(this.loginForm.password()),
  );

  protected async onSubmit(): Promise<void> {
    if (this.loginForm().invalid()) {
      this.loginForm().markAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    try {
      const succeeded = await this.sessionProvider.signInWithPassword({
        email: this.model().email.trim(),
        password: this.model().password,
      });
      if (!succeeded) return;
      this.model.set({ email: this.model().email, password: '' });
      this.loginForm.password().reset();
      void this.router.navigate([`/${DEFAULT_ROUTE_SEGMENT}`]);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected async onMagicLink(): Promise<void> {
    const email = this.model().email.trim();
    if (this.loginForm.email().invalid() || email.length === 0) {
      this.loginForm.email().markAsTouched();
      this.notificationService.showError(this.translationKeys.auth.errors.emailRequired);
      return;
    }
    this.isMagicLinkLoading.set(true);
    try {
      const succeeded = await this.sessionProvider.signInWithMagicLink(email, window.location.origin);
      if (succeeded) {
        this.notificationService.showInfo(this.translationKeys.auth.feedback.magicLinkSent);
      }
    } finally {
      this.isMagicLinkLoading.set(false);
    }
  }

  protected async onResetPassword(): Promise<void> {
    if (this.isResettingPassword()) {
      return;
    }
    const email = this.model().email.trim();
    if (this.loginForm.email().invalid() || email.length === 0) {
      this.loginForm.email().markAsTouched();
      this.notificationService.showError(this.translationKeys.auth.errors.emailRequired);
      return;
    }
    this.isResettingPassword.set(true);
    try {
      const redirectTo = `${window.location.origin}${ROUTE_PATHS.authPasswordReset}`;
      const succeeded = await this.sessionProvider.sendPasswordResetEmail(email, redirectTo);
      if (succeeded) {
        this.notificationService.showInfo(this.translationKeys.auth.feedback.passwordResetSent);
      }
    } finally {
      this.isResettingPassword.set(false);
    }
  }
}
