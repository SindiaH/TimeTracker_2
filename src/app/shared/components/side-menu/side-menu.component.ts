import { ChangeDetectionStrategy, Component, computed, effect, inject, Signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ComponentBase } from '@core/base/component-base';
import { AppIcon, APP_ICONS } from '@core/constants/app-icons';
import { ROUTE_PATHS } from '@core/constants/app-routes';
import { LANGUAGE_IDS, LanguageId } from '@core/constants/language.constants';
import { NavLink, PRIMARY_NAV_LINKS, SECONDARY_NAV_LINKS } from '@core/constants/nav-links';
import { THEME_PREFERENCES, ThemePreference } from '@core/constants/theme.constants';
import { TRANSLATION_KEYS, TranslationKey } from '@core/constants/translation-keys';
import { TranslationService } from '@core/i18n/translation.service';
import { SessionProvider } from '@core/providers/session.provider';
import { MenuStateService } from '@core/services/menu-state/menu-state.service';
import { ThemeService } from '@core/services/theme/theme.service';
import { ButtonToggleValue } from '@shared/base-components/button-toggle/button-toggle.component';
import { ButtonToggleOption } from '@shared/base-components/button-toggle/button-toggle.type';

@Component({
  selector: 'app-side-menu',
  standalone: false,
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideMenuComponent extends ComponentBase {
  private readonly themeService = inject(ThemeService);
  private readonly translationService = inject(TranslationService);
  private readonly menuStateService = inject(MenuStateService);
  private readonly sessionProvider = inject(SessionProvider);
  private readonly router = inject(Router);

  protected readonly navAriaLabelKey: TranslationKey = TRANSLATION_KEYS.header.navigation;
  protected readonly signOutLabelKey: TranslationKey = TRANSLATION_KEYS.auth.signOut;
  protected readonly signOutIcon: AppIcon = APP_ICONS.signOut;

  protected readonly primaryNavLinks: ReadonlyArray<NavLink> = PRIMARY_NAV_LINKS;
  protected readonly secondaryNavLinks: ReadonlyArray<NavLink> = SECONDARY_NAV_LINKS;

  protected readonly isMobile: Signal<boolean> = this.menuStateService.isMobile;
  protected readonly isAuthenticated: Signal<boolean> = this.sessionProvider.isAuthenticated;
  protected readonly isSigningOut: Signal<boolean> = this.sessionProvider.isSigningOut;

  protected readonly theme: Signal<ThemePreference> = this.themeService.theme;
  protected readonly language: Signal<LanguageId> = this.translationService.selectedLanguageId$;

  protected readonly themeControl: FormControl<ButtonToggleValue> = new FormControl<ButtonToggleValue>(
    this.themeService.theme(),
  );

  protected readonly languageControl: FormControl<ButtonToggleValue> = new FormControl<ButtonToggleValue>(
    this.translationService.getSelectedLanguageId(),
  );

  protected readonly themeOptions: Signal<ButtonToggleOption[]> = computed<ButtonToggleOption[]>(() => [
    { id: THEME_PREFERENCES.light, name: '', icon: APP_ICONS.themeLight },
    { id: THEME_PREFERENCES.dark, name: '', icon: APP_ICONS.themeDark },
    { id: THEME_PREFERENCES.system, name: '', icon: APP_ICONS.themeSystem },
  ]);

  protected readonly languageOptions: Signal<ButtonToggleOption[]> = computed<ButtonToggleOption[]>(() => [
    { id: LANGUAGE_IDS.enUs, name: 'EN' },
    { id: LANGUAGE_IDS.deAt, name: 'DE' },
  ]);

  constructor() {
    super();

    effect(() => {
      const preference = this.theme();
      if (this.themeControl.value !== preference) {
        this.themeControl.setValue(preference, { emitEvent: false });
      }
    });

    effect(() => {
      const langId = this.language();
      if (this.languageControl.value !== langId) {
        this.languageControl.setValue(langId, { emitEvent: false });
      }
    });
  }

  protected onLinkClicked(): void {
    if (this.isMobile()) {
      this.menuStateService.close();
    }
  }

  protected async onSignOut(): Promise<void> {
    await this.sessionProvider.signOut();
    if (this.isMobile()) {
      this.menuStateService.close();
    }
    void this.router.navigateByUrl(ROUTE_PATHS.authLogin);
  }

  protected onThemeChanged(value: ButtonToggleValue): void {
    if (this.isThemePreference(value)) {
      this.themeService.setTheme(value);
    }
  }

  protected onLanguageChanged(value: ButtonToggleValue): void {
    if (this.isLanguageId(value)) {
      this.translationService.setLanguage(value);
    }
  }

  private isThemePreference(value: ButtonToggleValue): value is ThemePreference {
    return value === THEME_PREFERENCES.light || value === THEME_PREFERENCES.dark || value === THEME_PREFERENCES.system;
  }

  private isLanguageId(value: ButtonToggleValue): value is LanguageId {
    return value === LANGUAGE_IDS.enUs || value === LANGUAGE_IDS.deAt;
  }
}
