import { Directive, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ComponentBase } from '@core/base/component-base';
import { PASSWORD_MIN_LENGTH } from '@core/constants/auth.constants';
import { FORM_ERROR_CODES } from '@core/constants/form-error-codes';
import { TranslationService } from '@core/i18n/translation.service';
import { NotificationService } from '@core/services/notification/notification.service';

@Directive()
export abstract class AuthFormBase extends ComponentBase {
  protected readonly translationService = inject(TranslationService);
  protected readonly notificationService = inject(NotificationService);

  protected getEmailError(control: FormControl<string>): string | null {
    if (!control.touched) {
      return null;
    }
    if (control.hasError(FORM_ERROR_CODES.required)) {
      return this.translationService.instant(this.translationKeys.auth.errors.emailRequired);
    }
    if (control.hasError(FORM_ERROR_CODES.email)) {
      return this.translationService.instant(this.translationKeys.auth.errors.emailInvalid);
    }
    return null;
  }

  protected getPasswordError(control: FormControl<string>): string | null {
    if (!control.touched) {
      return null;
    }
    if (control.hasError(FORM_ERROR_CODES.required)) {
      return this.translationService.instant(this.translationKeys.auth.errors.passwordRequired);
    }
    if (control.hasError(FORM_ERROR_CODES.minLength)) {
      return this.translationService.instant(this.translationKeys.auth.errors.passwordMinLength, {
        count: PASSWORD_MIN_LENGTH,
      });
    }
    return null;
  }

  protected getConfirmPasswordError(control: FormControl<string>): string | null {
    if (!control.touched) {
      return null;
    }
    if (control.hasError(FORM_ERROR_CODES.required)) {
      return this.translationService.instant(this.translationKeys.auth.errors.passwordRequired);
    }
    if (control.hasError(FORM_ERROR_CODES.mismatch)) {
      return this.translationService.instant(this.translationKeys.auth.errors.passwordMismatch);
    }
    return null;
  }
}
