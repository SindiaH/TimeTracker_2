import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServiceBase } from '@core/base/service-base';
import { TRANSLATION_KEYS, TranslationKey } from '@core/constants/translation-keys';
import { TranslationService } from '@core/i18n/translation.service';

type NotificationParams = Record<string, unknown>;
type NotificationKind = 'error' | 'info' | 'success';

const DURATION_MS: Record<NotificationKind, number> = {
  error: 6000,
  info: 4000,
  success: 4000,
};

@Injectable({ providedIn: 'root' })
export class NotificationService extends ServiceBase {
  private readonly snackBar = inject(MatSnackBar);
  private readonly translationService = inject(TranslationService);

  showError(messageKey: TranslationKey, params?: NotificationParams): void {
    this.show('error', messageKey, params);
  }

  showInfo(messageKey: TranslationKey, params?: NotificationParams): void {
    this.show('info', messageKey, params);
  }

  showSuccess(messageKey: TranslationKey, params?: NotificationParams): void {
    this.show('success', messageKey, params);
  }

  private show(kind: NotificationKind, messageKey: TranslationKey, params?: NotificationParams): void {
    const message = this.translationService.instant(messageKey, params);
    const dismiss = this.translationService.instant(TRANSLATION_KEYS.shared.close);
    this.snackBar.open(message, dismiss, {
      duration: DURATION_MS[kind],
      panelClass: [`app-snackbar`, `app-snackbar--${kind}`],
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
    });
  }
}
