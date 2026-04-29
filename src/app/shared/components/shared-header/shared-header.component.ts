import { ChangeDetectionStrategy, Component, computed, effect, inject, Signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ButtonToggleValue } from '@shared/base-components/button-toggle/button-toggle.component';
import { ButtonToggleOption } from '@shared/base-components/button-toggle/button-toggle.type';
import { ComponentBase } from '@core/base/component-base';
import { ThemeService } from '@core/services/theme/theme.service';
import { ThemePreference } from '@core/services/theme/theme.type';
import { TranslationService } from '@core/i18n/translation.service';
import { LanguageId } from '@core/i18n/translation.types';

type NavLink = {
  path: string;
  translationKey: string;
  icon: string;
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

  protected readonly theme: Signal<ThemePreference> = this.themeService.theme;
  protected readonly language: Signal<LanguageId> = this.translationService.selectedLanguageId$;

  protected readonly themeControl: FormControl<ButtonToggleValue> = new FormControl<ButtonToggleValue>(
    this.themeService.theme(),
  );

  protected readonly languageControl: FormControl<ButtonToggleValue> = new FormControl<ButtonToggleValue>(
    this.translationService.getSelectedLanguageId(),
  );

  protected readonly themeOptions: Signal<ButtonToggleOption[]> = computed<ButtonToggleOption[]>(() => [
    { id: 'light', name: '', icon: 'light_mode' },
    { id: 'dark', name: '', icon: 'dark_mode' },
    { id: 'system', name: '', icon: 'desktop_windows' },
  ]);

  protected readonly languageOptions: Signal<ButtonToggleOption[]> = computed<ButtonToggleOption[]>(() => [
    { id: 'en-US', name: 'EN' },
    { id: 'de-AT', name: 'DE' },
  ]);

  protected readonly navLinks: ReadonlyArray<NavLink> = [
    { path: '/tasks', translationKey: 'modules.tasks', icon: 'check_circle' },
    { path: '/time-entries', translationKey: 'modules.timeEntries', icon: 'schedule' },
    { path: '/calendar', translationKey: 'modules.calendar', icon: 'calendar_month' },
    { path: '/activities', translationKey: 'modules.activities', icon: 'analytics' },
    { path: '/settings', translationKey: 'modules.settings', icon: 'settings' },
    { path: '/auth', translationKey: 'modules.auth', icon: 'lock' },
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
    return value === 'light' || value === 'dark' || value === 'system';
  }

  private isLanguageId(value: ButtonToggleValue): value is LanguageId {
    return value === 'en-US' || value === 'de-AT';
  }
}
