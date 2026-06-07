import { ChangeDetectionStrategy, Component, computed, inject, Signal, signal } from '@angular/core';
import { email, form, minLength, required } from '@angular/forms/signals';
import { ROUTE_PATHS } from '@core/constants/app-routes';
import { PASSWORD_MIN_LENGTH } from '@core/constants/auth.constants';
import { SessionProvider } from '@core/providers/session.provider';
import { AuthFormBase } from '@modules/auth/utils/auth-form-base';
import { matchValueValidator } from '@modules/auth/utils/match-control.validator';

type RegisterModel = {
  email: string;
  password: string;
  confirmPassword: string;
};

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent extends AuthFormBase {
  private readonly sessionProvider = inject(SessionProvider);

  protected readonly loginLink: string = ROUTE_PATHS.authLogin;

  protected readonly model = signal<RegisterModel>({ email: '', password: '', confirmPassword: '' });

  protected readonly registerForm = form(this.model, (f) => {
    required(f.email);
    email(f.email);
    required(f.password);
    minLength(f.password, PASSWORD_MIN_LENGTH);
    required(f.confirmPassword);
    matchValueValidator(f.confirmPassword, f.password);
  });

  protected readonly isSubmitting = signal<boolean>(false);

  protected readonly emailError: Signal<string | null> = computed<string | null>(() =>
    this.getEmailError(this.registerForm.email()),
  );
  protected readonly passwordError: Signal<string | null> = computed<string | null>(() =>
    this.getPasswordError(this.registerForm.password()),
  );
  protected readonly confirmPasswordError: Signal<string | null> = computed<string | null>(() =>
    this.getConfirmPasswordError(this.registerForm.confirmPassword()),
  );

  protected async onSubmit(): Promise<void> {
    if (this.registerForm().invalid()) {
      this.registerForm().markAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    try {
      const succeeded = await this.sessionProvider.signUpWithPassword({
        email: this.model().email.trim(),
        password: this.model().password,
      });
      if (!succeeded) return;
      this.notificationService.showSuccess(this.translationKeys.auth.feedback.signupSuccess);
      this.model.set({ email: '', password: '', confirmPassword: '' });
      this.registerForm().reset();
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
