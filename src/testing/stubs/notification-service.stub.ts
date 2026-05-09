import { Injectable } from '@angular/core';
import { TranslationKey } from '@core/constants/translation-keys';

type NotificationParams = Record<string, unknown>;

@Injectable()
export class NotificationServiceStub {
  readonly errorCalls: { messageKey: TranslationKey; params?: NotificationParams }[] = [];
  readonly infoCalls: { messageKey: TranslationKey; params?: NotificationParams }[] = [];
  readonly successCalls: { messageKey: TranslationKey; params?: NotificationParams }[] = [];

  showError(messageKey: TranslationKey, params?: NotificationParams): void {
    this.errorCalls.push({ messageKey, params });
  }

  showInfo(messageKey: TranslationKey, params?: NotificationParams): void {
    this.infoCalls.push({ messageKey, params });
  }

  showSuccess(messageKey: TranslationKey, params?: NotificationParams): void {
    this.successCalls.push({ messageKey, params });
  }
}
