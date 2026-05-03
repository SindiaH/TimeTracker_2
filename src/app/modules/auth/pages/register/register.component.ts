import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ROUTE_PATHS } from '@core/constants/app-routes';
import { PASSWORD_MIN_LENGTH } from '@core/constants/auth.constants';
import { SessionProvider } from '@core/providers/session.provider';
import { AuthFormBase } from '@modules/auth/utils/auth-form-base';
import { matchControlsValidator } from '@modules/auth/utils/match-control.validator';

type RegisterForm = {
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
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

  protected readonly emailControl: FormControl<string> = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });

  protected readonly passwordControl: FormControl<string> = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(PASSWORD_MIN_LENGTH)],
  });

  protected readonly confirmPasswordControl: FormControl<string> = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  protected readonly registerForm: FormGroup<RegisterForm> = new FormGroup<RegisterForm>(
    {
      email: this.emailControl,
      password: this.passwordControl,
      confirmPassword: this.confirmPasswordControl,
    },
    { validators: [matchControlsValidator('password', 'confirmPassword')] },
  );

  protected readonly isSubmitting = signal<boolean>(false);

  protected async onSubmit(): Promise<void> {
    this.feedback.set(null);
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    try {
      await this.sessionProvider.signUpWithPassword({
        email: this.emailControl.value.trim(),
        password: this.passwordControl.value,
      });
      this.feedback.set({
        kind: 'success',
        message: this.translationService.instant(this.translationKeys.feedback.signupSuccess),
      });
      this.registerForm.reset();
    } catch (error) {
      this.feedback.set({
        kind: 'error',
        message: this.resolveErrorMessage(error, this.translationKeys.errors.unexpected),
      });
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
