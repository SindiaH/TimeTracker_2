import { ChangeDetectionStrategy, Component, computed, effect, inject, Signal, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DEFAULT_ROUTE_SEGMENT, ROUTE_PATHS } from '@core/constants/app-routes';
import { PASSWORD_MIN_LENGTH } from '@core/constants/auth.constants';
import { SessionProvider } from '@core/providers/session.provider';
import { AuthFormBase } from '@modules/auth/utils/auth-form-base';
import { matchControlsValidator } from '@modules/auth/utils/match-control.validator';

type PasswordResetForm = {
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
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
  private readonly document = inject(DOCUMENT);

  protected readonly loginLink: string = ROUTE_PATHS.authLogin;

  protected readonly passwordControl: FormControl<string> = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(PASSWORD_MIN_LENGTH)],
  });

  protected readonly confirmPasswordControl: FormControl<string> = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  protected readonly resetForm: FormGroup<PasswordResetForm> = new FormGroup<PasswordResetForm>(
    {
      password: this.passwordControl,
      confirmPassword: this.confirmPasswordControl,
    },
    { validators: [matchControlsValidator('password', 'confirmPassword')] },
  );

  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly isInitializing = signal<boolean>(this.sessionProvider.isLoading());

  protected readonly canResetPassword: Signal<boolean> = computed<boolean>(() =>
    this.sessionProvider.isPasswordRecovery(),
  );

  constructor() {
    super();
    effect(() => {
      if (!this.sessionProvider.isLoading()) {
        this.isInitializing.set(false);
      }
    });
  }

  protected async onSubmit(): Promise<void> {
    this.feedback.set(null);
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
    try {
      await this.sessionProvider.updatePassword(this.passwordControl.value);
      this.feedback.set({
        kind: 'success',
        message: this.translationService.instant(this.translationKeys.feedback.passwordUpdated),
      });
      this.resetForm.reset();
      this.stripRecoveryTokensFromUrl();
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

  private stripRecoveryTokensFromUrl(): void {
    const view = this.document.defaultView;
    if (!view) {
      return;
    }
    const { pathname, search } = view.location;
    view.history.replaceState({}, this.document.title, `${pathname}${search}`);
  }
}
