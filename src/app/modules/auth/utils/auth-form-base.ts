import { Directive, inject, signal, WritableSignal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ComponentBase } from '@core/base/component-base';
import { TRANSLATION_KEYS } from '@core/constants/translation-keys';
import { TranslationService } from '@core/i18n/translation.service';
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
      return this.translationService.instant(this.translationKeys.errors.passwordMinLength);
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

  protected resolveErrorMessage(error: unknown, fallbackKey: string): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return this.translationService.instant(fallbackKey);
  }
}
