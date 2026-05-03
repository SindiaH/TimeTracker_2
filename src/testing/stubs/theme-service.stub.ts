import { computed, Injectable, Signal, signal } from '@angular/core';
import {
  DEFAULT_THEME_PREFERENCE,
  RESOLVED_THEMES,
  ResolvedTheme,
  ThemePreference,
} from '@core/constants/theme.constants';

@Injectable()
export class ThemeServiceStub {
  private readonly _theme = signal<ThemePreference>(DEFAULT_THEME_PREFERENCE);

  readonly theme: Signal<ThemePreference> = this._theme.asReadonly();
  readonly resolvedTheme = computed<ResolvedTheme>(() => RESOLVED_THEMES.light);
  readonly isDark = computed<boolean>(() => false);

  setTheme(preference: ThemePreference): void {
    this._theme.set(preference);
  }
}
