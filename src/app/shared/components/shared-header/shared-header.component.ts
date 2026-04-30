import { ChangeDetectionStrategy, Component, computed, effect, inject, Signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ButtonToggleValue } from '@shared/base-components/button-toggle/button-toggle.component';
import { ButtonToggleOption } from '@shared/base-components/button-toggle/button-toggle.type';
import { ComponentBase } from '@core/base/component-base';
import { APP_ICONS, AppIcon } from '@core/constants/app-icons';
import { ROUTE_PATHS, RoutePath } from '@core/constants/app-routes';
import { LANGUAGE_IDS, LanguageId } from '@core/constants/language.constants';
import { THEME_PREFERENCES, ThemePreference } from '@core/constants/theme.constants';
import { TRANSLATION_KEYS, TranslationKey } from '@core/constants/translation-keys';
import { TranslationService } from '@core/i18n/translation.service';
import { ThemeService } from '@core/services/theme/theme.service';

type NavLink = {
  path: RoutePath;
  translationKey: TranslationKey;
  icon: AppIcon;
};

@Component({
  selector: 'app-shared-header',
  standalone: false,
  templateUrl: './shared-header.component.html',
  styleUrl: './shared-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedHeaderComponent extends ComponentBase {
  private readonly themeService = inject(ThemeService);
  private readonly translationService = inject(TranslationService);

  protected readonly brandIcon: AppIcon = APP_ICONS.brand;
  protected readonly brandTitleKey: TranslationKey = TRANSLATION_KEYS.app.title;
  protected readonly navAriaLabelKey: TranslationKey = TRANSLATION_KEYS.header.navigation;

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

  protected readonly navLinks: ReadonlyArray<NavLink> = [
    { path: ROUTE_PATHS.tasks, translationKey: TRANSLATION_KEYS.modules.tasks, icon: APP_ICONS.navTasks },
    {
      path: ROUTE_PATHS.timeEntries,
      translationKey: TRANSLATION_KEYS.modules.timeEntries,
      icon: APP_ICONS.navTimeEntries,
    },
    { path: ROUTE_PATHS.calendar, translationKey: TRANSLATION_KEYS.modules.calendar, icon: APP_ICONS.navCalendar },
    {
      path: ROUTE_PATHS.activities,
      translationKey: TRANSLATION_KEYS.modules.activities,
      icon: APP_ICONS.navActivities,
    },
    { path: ROUTE_PATHS.settings, translationKey: TRANSLATION_KEYS.modules.settings, icon: APP_ICONS.navSettings },
    { path: ROUTE_PATHS.auth, translationKey: TRANSLATION_KEYS.modules.auth, icon: APP_ICONS.navAuth },
  ];

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
