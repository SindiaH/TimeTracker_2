import { Directive, inject } from '@angular/core';
import type { FieldState } from '@angular/forms/signals';
import { ComponentBase } from '@core/base/component-base';
import { PASSWORD_MIN_LENGTH } from '@core/constants/auth.constants';
import { TranslationService } from '@core/i18n/translation.service';
import { NotificationService } from '@core/services/notification/notification.service';

@Directive()
export abstract class AuthFormBase extends ComponentBase {
  protected readonly translationService = inject(TranslationService);
  protected readonly notificationService = inject(NotificationService);

  protected getEmailError(state: FieldState<string>): string | null {
    if (!state.touched()) {
      return null;
    }
    if (state.getError('required')) {
      return this.translationService.instant(this.translationKeys.auth.errors.emailRequired);
    }
    if (state.getError('email')) {
      return this.translationService.instant(this.translationKeys.auth.errors.emailInvalid);
    }
    return null;
  }

  protected getPasswordError(state: FieldState<string>): string | null {
    if (!state.touched()) {
      return null;
    }
    if (state.getError('required')) {
      return this.translationService.instant(this.translationKeys.auth.errors.passwordRequired);
    }
    if (state.getError('minLength')) {
      return this.translationService.instant(this.translationKeys.auth.errors.passwordMinLength, {
        count: PASSWORD_MIN_LENGTH,
      });
    }
    return null;
  }

  protected getConfirmPasswordError(state: FieldState<string>): string | null {
    if (!state.touched()) {
      return null;
    }
    if (state.getError('required')) {
      return this.translationService.instant(this.translationKeys.auth.errors.passwordRequired);
    }
    if (state.getError('mismatch')) {
      return this.translationService.instant(this.translationKeys.auth.errors.passwordMismatch);
    }
    return null;
  }
}
