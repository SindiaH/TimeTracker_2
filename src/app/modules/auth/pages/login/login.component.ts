import { ChangeDetectionStrategy, Component, computed, inject, Signal, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DEFAULT_ROUTE_SEGMENT, ROUTE_PATHS } from '@core/constants/app-routes';
import { PASSWORD_MIN_LENGTH } from '@core/constants/auth.constants';
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
    validators: [Validators.required, Validators.minLength(PASSWORD_MIN_LENGTH)],
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
    try {
      const succeeded = await this.sessionProvider.signInWithPassword({
        email: this.emailControl.value.trim(),
        password: this.passwordControl.value,
      });
      if (!succeeded) return;
      this.passwordControl.reset();
      void this.router.navigate([`/${DEFAULT_ROUTE_SEGMENT}`]);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected async onMagicLink(): Promise<void> {
    const email = this.emailControl.value.trim();
    if (this.emailControl.invalid || email.length === 0) {
      this.emailControl.markAsTouched();
      this.notificationService.showError(this.translationKeys.errors.emailRequired);
      return;
    }
    this.isMagicLinkLoading.set(true);
    try {
      const succeeded = await this.sessionProvider.signInWithMagicLink(email, window.location.origin);
      if (succeeded) {
        this.notificationService.showInfo(this.translationKeys.feedback.magicLinkSent);
      }
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
      this.notificationService.showError(this.translationKeys.errors.emailRequired);
      return;
    }
    this.isResettingPassword.set(true);
    try {
      const redirectTo = `${window.location.origin}${ROUTE_PATHS.authPasswordReset}`;
      const succeeded = await this.sessionProvider.sendPasswordResetEmail(email, redirectTo);
      if (succeeded) {
        this.notificationService.showInfo(this.translationKeys.feedback.passwordResetSent);
      }
    } finally {
      this.isResettingPassword.set(false);
    }
  }
}
