import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { ComponentBase } from '@core/base/component-base';
import { AppIcon, APP_ICONS } from '@core/constants/app-icons';
import { ROUTE_PATHS } from '@core/constants/app-routes';
import { TRANSLATION_KEYS, TranslationKey } from '@core/constants/translation-keys';
import { SessionProvider } from '@core/providers/session.provider';
import { SessionUser } from '@core/providers/session.type';

type AccountField = {
  labelKey: TranslationKey;
  value: string;
};

@Component({
  selector: 'app-account',
  standalone: false,
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountComponent extends ComponentBase {
  private readonly sessionProvider = inject(SessionProvider);
  private readonly router = inject(Router);

  protected readonly translationKeys = TRANSLATION_KEYS.account;
  protected readonly signOutLabelKey: TranslationKey = TRANSLATION_KEYS.auth.signOut;
  protected readonly signOutIcon: AppIcon = APP_ICONS.signOut;

  protected readonly user: Signal<SessionUser | null> = this.sessionProvider.user;
  protected readonly isSigningOut: Signal<boolean> = this.sessionProvider.isLoading;

  protected readonly fields: Signal<AccountField[]> = computed<AccountField[]>(() => {
    const user = this.user();
    if (user === null) {
      return [];
    }
    return [
      { labelKey: this.translationKeys.fields.email, value: user.email },
      { labelKey: this.translationKeys.fields.userId, value: user.id },
    ];
  });

  protected async onSignOut(): Promise<void> {
    await this.sessionProvider.signOut();
    void this.router.navigateByUrl(ROUTE_PATHS.authLogin);
  }
}
