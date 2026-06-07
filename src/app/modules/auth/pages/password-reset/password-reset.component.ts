import { ChangeDetectionStrategy, Component, computed, effect, inject, Signal, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { form, minLength, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { ComponentBase } from '@core/base/component-base';
import { DEFAULT_ROUTE_SEGMENT, ROUTE_PATHS } from '@core/constants/app-routes';
import { PASSWORD_MIN_LENGTH } from '@core/constants/auth.constants';
import { TranslationService } from '@core/i18n/translation.service';
import { SessionProvider } from '@core/providers/session.provider';
import { NotificationService } from '@core/services/notification/notification.service';
import { matchValueValidator } from '@modules/auth/utils/match-control.validator';

type PasswordResetModel = {
  password: string;
  confirmPassword: string;
};

@Component({
  selector: 'app-password-reset',
  standalone: false,
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordResetComponent extends ComponentBase {
  private readonly sessionProvider = inject(SessionProvider);
  private readonly notificationService = inject(NotificationService);
  private readonly translationService = inject(TranslationService);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  protected readonly loginLink: string = ROUTE_PATHS.authLogin;

  protected readonly model = signal<PasswordResetModel>({ password: '', confirmPassword: '' });

  protected readonly resetForm = form(this.model, (f) => {
    required(f.password);
    minLength(f.password, PASSWORD_MIN_LENGTH);
    required(f.confirmPassword);
    matchValueValidator(f.confirmPassword, f.password);
  });

  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly isInitializing = signal<boolean>(this.sessionProvider.isLoading());

  protected readonly canResetPassword: Signal<boolean> = computed<boolean>(() =>
    this.sessionProvider.isPasswordRecovery(),
  );

  protected readonly confirmPasswordError: Signal<string | null> = computed<string | null>(() => {
    const state = this.resetForm.confirmPassword();
    if (!state.touched()) return null;
    if (state.getError('mismatch')) {
      return this.translationService.instant(this.translationKeys.auth.errors.passwordMismatch);
    }
    return null;
  });

  constructor() {
    super();
    effect(() => {
      if (!this.sessionProvider.isLoading()) {
        this.isInitializing.set(false);
      }
    });
  }

  protected async onSubmit(): Promise<void> {
    if (this.resetForm().invalid()) {
      this.resetForm().markAsTouched();
      return;
    }
    if (!this.canResetPassword()) {
      this.notificationService.showError(this.translationKeys.auth.errors.recoveryLinkInvalid);
      return;
    }
    this.isSubmitting.set(true);
    try {
      const succeeded = await this.sessionProvider.updatePassword(this.model().password);
      if (!succeeded) return;
      this.notificationService.showSuccess(this.translationKeys.auth.feedback.passwordUpdated);
      this.model.set({ password: '', confirmPassword: '' });
      this.resetForm().reset();
      this.stripRecoveryTokensFromUrl();
      void this.router.navigate([`/${DEFAULT_ROUTE_SEGMENT}`]);
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
