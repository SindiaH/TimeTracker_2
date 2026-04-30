import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, Renderer2, RendererFactory2, Signal, signal } from '@angular/core';
import { ServiceBase } from '@core/base/service-base';
import { LOCAL_STORAGE_KEYS } from '@core/constants/storage-keys';
import {
  DEFAULT_THEME_PREFERENCE,
  PREFERS_DARK_MEDIA_QUERY,
  RESOLVED_THEMES,
  ResolvedTheme,
  THEME_CLASS_NAMES,
  THEME_PREFERENCE_VALUES,
  THEME_PREFERENCES,
  ThemePreference,
} from '@core/constants/theme.constants';

@Injectable({ providedIn: 'root' })
export class ThemeService extends ServiceBase {
  private readonly document = inject(DOCUMENT);
  private readonly renderer: Renderer2 = inject(RendererFactory2).createRenderer(null, null);

  private readonly mediaQuery: MediaQueryList | null = this.document.defaultView?.matchMedia
    ? this.document.defaultView.matchMedia(PREFERS_DARK_MEDIA_QUERY)
    : null;

  private readonly _theme = signal<ThemePreference>(this.readPersistedPreference());
  private readonly _systemPrefersDark = signal<boolean>(this.mediaQuery?.matches ?? false);

  readonly theme: Signal<ThemePreference> = this._theme.asReadonly();

  readonly resolvedTheme = computed<ResolvedTheme>(() => {
    const preference = this._theme();

    if (preference === THEME_PREFERENCES.system) {
      return this._systemPrefersDark() ? RESOLVED_THEMES.dark : RESOLVED_THEMES.light;
    }

    return preference;
  });

  readonly isDark = computed<boolean>(() => this.resolvedTheme() === RESOLVED_THEMES.dark);

  constructor() {
    super();

    this.subscribeToSystemPreference();

    effect(() => {
      const resolved = this.resolvedTheme();
      this.applyThemeClass(resolved);
    });

    effect(() => {
      const preference = this._theme();
      this.persistPreference(preference);
    });
  }

  setTheme(preference: ThemePreference): void {
    this._theme.set(preference);
  }

  private applyThemeClass(resolved: ResolvedTheme): void {
    const root = this.document.documentElement;

    for (const themeClass of Object.values(THEME_CLASS_NAMES)) {
      this.renderer.removeClass(root, themeClass);
    }

    this.renderer.addClass(root, THEME_CLASS_NAMES[resolved]);
  }

  private subscribeToSystemPreference(): void {
    if (!this.mediaQuery) {
      return;
    }

    const listener = (event: MediaQueryListEvent): void => this._systemPrefersDark.set(event.matches);
    this.mediaQuery.addEventListener('change', listener);

    this.destroyRef.onDestroy(() => this.mediaQuery?.removeEventListener('change', listener));
  }

  private readPersistedPreference(): ThemePreference {
    const storage = this.document.defaultView?.localStorage;
    const stored = storage?.getItem(LOCAL_STORAGE_KEYS.theme);

    if (stored !== null && stored !== undefined && this.isValidPreference(stored)) {
      return stored;
    }

    return DEFAULT_THEME_PREFERENCE;
  }

  private persistPreference(preference: ThemePreference): void {
    const storage = this.document.defaultView?.localStorage;
    storage?.setItem(LOCAL_STORAGE_KEYS.theme, preference);
  }

  private isValidPreference(value: string): value is ThemePreference {
    return (THEME_PREFERENCE_VALUES as ReadonlyArray<string>).includes(value);
  }
}
