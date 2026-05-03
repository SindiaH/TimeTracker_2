import { Directive, inject, signal, WritableSignal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ComponentBase } from '@core/base/component-base';
import { PASSWORD_MIN_LENGTH } from '@core/constants/auth.constants';
import { TRANSLATION_KEYS, TranslationKey } from '@core/constants/translation-keys';
import { TranslationService } from '@core/i18n/translation.service';
import { AuthErrorCode, AuthOperationError } from '@database/services/interfaces/auth-error';
import { InfoType } from '@shared/base-components/info/info.component';

export type FeedbackKind = Extract<InfoType, 'error' | 'info' | 'success' | 'warning'>;

export type Feedback = {
  kind: FeedbackKind;
  message: string;
};

@Directive()
export abstract class AuthFormBase extends ComponentBase {
  protected readonly translationService = inject(TranslationService);
  protected readonly translationKeys = TRANSLATION_KEYS.auth;

  protected readonly feedback: WritableSignal<Feedback | null> = signal<Feedback | null>(null);

  protected getEmailError(control: FormControl<string>): string | null {
    if (!control.touched) {
      return null;
    }
    if (control.hasError('required')) {
      return this.translationService.instant(this.translationKeys.errors.emailRequired);
    }
    if (control.hasError('email')) {
      return this.translationService.instant(this.translationKeys.errors.emailInvalid);
    }
    return null;
  }

  protected getPasswordError(control: FormControl<string>): string | null {
    if (!control.touched) {
      return null;
    }
    if (control.hasError('required')) {
      return this.translationService.instant(this.translationKeys.errors.passwordRequired);
    }
    if (control.hasError('minlength')) {
      return this.translationService.instant(this.translationKeys.errors.passwordMinLength, {
        count: PASSWORD_MIN_LENGTH,
      });
    }
    return null;
  }

  protected getConfirmPasswordError(control: FormControl<string>): string | null {
    if (!control.touched) {
      return null;
    }
    if (control.hasError('required')) {
      return this.translationService.instant(this.translationKeys.errors.passwordRequired);
    }
    if (control.hasError('mismatch')) {
      return this.translationService.instant(this.translationKeys.errors.passwordMismatch);
    }
    return null;
  }

  protected resolveErrorMessage(error: unknown, fallbackKey: TranslationKey): string {
    if (error instanceof AuthOperationError && error.code !== 'unknown') {
      return this.translationService.instant(AUTH_ERROR_TRANSLATION_KEYS[error.code]);
    }
    return this.translationService.instant(fallbackKey);
  }
}

const AUTH_ERROR_TRANSLATION_KEYS: Record<Exclude<AuthErrorCode, 'unknown'>, TranslationKey> = {
  'invalid-credentials': TRANSLATION_KEYS.auth.errors.invalidCredentials,
  'email-not-confirmed': TRANSLATION_KEYS.auth.errors.emailNotConfirmed,
  'user-already-exists': TRANSLATION_KEYS.auth.errors.userAlreadyExists,
  'user-not-found': TRANSLATION_KEYS.auth.errors.userNotFound,
  'weak-password': TRANSLATION_KEYS.auth.errors.weakPassword,
  'same-password': TRANSLATION_KEYS.auth.errors.samePassword,
  'invalid-email': TRANSLATION_KEYS.auth.errors.emailInvalid,
  'rate-limit': TRANSLATION_KEYS.auth.errors.rateLimit,
  'otp-disabled': TRANSLATION_KEYS.auth.errors.otpDisabled,
  'recovery-link-invalid': TRANSLATION_KEYS.auth.errors.recoveryLinkInvalid,
  'signup-disabled': TRANSLATION_KEYS.auth.errors.signupDisabled,
};
