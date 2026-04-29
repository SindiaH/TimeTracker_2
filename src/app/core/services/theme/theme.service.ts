import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, Renderer2, RendererFactory2, Signal, signal } from '@angular/core';
import { ServiceBase } from '@core/base/service-base';
import { ResolvedTheme, ThemePreference } from '@core/services/theme/theme.type';

const STORAGE_KEY = 'time-tracker-theme';
const VALID_PREFERENCES: ReadonlyArray<ThemePreference> = ['light', 'dark', 'system'];
const THEME_CLASSES: Record<ResolvedTheme, string> = {
  light: 'theme-light',
  dark: 'theme-dark',
};

@Injectable({ providedIn: 'root' })
export class ThemeService extends ServiceBase {
  private readonly document = inject(DOCUMENT);
  private readonly renderer: Renderer2 = inject(RendererFactory2).createRenderer(null, null);

  private readonly mediaQuery: MediaQueryList | null = this.document.defaultView?.matchMedia
    ? this.document.defaultView.matchMedia('(prefers-color-scheme: dark)')
    : null;

  private readonly _theme = signal<ThemePreference>(this.readPersistedPreference());
  private readonly _systemPrefersDark = signal<boolean>(this.mediaQuery?.matches ?? false);

  readonly theme: Signal<ThemePreference> = this._theme.asReadonly();

  readonly resolvedTheme = computed<ResolvedTheme>(() => {
    const preference = this._theme();

    if (preference === 'system') {
      return this._systemPrefersDark() ? 'dark' : 'light';
    }

    return preference;
  });

  readonly isDark = computed<boolean>(() => this.resolvedTheme() === 'dark');

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

    for (const themeClass of Object.values(THEME_CLASSES)) {
      this.renderer.removeClass(root, themeClass);
    }

    this.renderer.addClass(root, THEME_CLASSES[resolved]);
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
    const stored = storage?.getItem(STORAGE_KEY);

    if (stored !== null && stored !== undefined && this.isValidPreference(stored)) {
      return stored;
    }

    return 'system';
  }

  private persistPreference(preference: ThemePreference): void {
    const storage = this.document.defaultView?.localStorage;
    storage?.setItem(STORAGE_KEY, preference);
  }

  private isValidPreference(value: string): value is ThemePreference {
    return (VALID_PREFERENCES as ReadonlyArray<string>).includes(value);
  }
}
