import { TestBed } from '@angular/core/testing';
import {
  DEFAULT_THEME_PREFERENCE,
  RESOLVED_THEMES,
  THEME_CLASS_NAMES,
  THEME_PREFERENCES,
} from '@core/constants/theme.constants';
import { LOCAL_STORAGE_KEYS } from '@core/constants/storage-keys';
import { DesktopService } from '@core/services/desktop/desktop.service';
import { ThemeService } from '@core/services/theme/theme.service';
import { DesktopServiceStub } from '@testing/stubs/desktop-service.stub';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove(THEME_CLASS_NAMES.light, THEME_CLASS_NAMES.dark);
    TestBed.configureTestingModule({
      providers: [{ provide: DesktopService, useClass: DesktopServiceStub }, ThemeService],
    });
  });

  it('defaults to system preference when localStorage is empty', () => {
    const service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe(DEFAULT_THEME_PREFERENCE);
  });

  it('reads persisted preference from localStorage', () => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.theme, THEME_PREFERENCES.dark);

    const service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe(THEME_PREFERENCES.dark);
  });

  it('falls back to default when persisted value is invalid', () => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.theme, 'midnight');

    const service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe(DEFAULT_THEME_PREFERENCE);
  });

  it('setTheme updates the signal and persists to localStorage', () => {
    const service = TestBed.inject(ThemeService);

    service.setTheme(THEME_PREFERENCES.dark);
    TestBed.tick();

    expect(service.theme()).toBe(THEME_PREFERENCES.dark);
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.theme)).toBe(THEME_PREFERENCES.dark);
  });

  it('resolvedTheme returns the explicit preference for light/dark', () => {
    const service = TestBed.inject(ThemeService);

    service.setTheme(THEME_PREFERENCES.dark);
    TestBed.tick();
    expect(service.resolvedTheme()).toBe(RESOLVED_THEMES.dark);
    expect(service.isDark()).toBe(true);

    service.setTheme(THEME_PREFERENCES.light);
    TestBed.tick();
    expect(service.resolvedTheme()).toBe(RESOLVED_THEMES.light);
    expect(service.isDark()).toBe(false);
  });

  it('applies the resolved theme class to the document root', () => {
    const service = TestBed.inject(ThemeService);

    service.setTheme(THEME_PREFERENCES.dark);
    TestBed.tick();

    expect(document.documentElement.classList.contains(THEME_CLASS_NAMES.dark)).toBe(true);
    expect(document.documentElement.classList.contains(THEME_CLASS_NAMES.light)).toBe(false);

    service.setTheme(THEME_PREFERENCES.light);
    TestBed.tick();

    expect(document.documentElement.classList.contains(THEME_CLASS_NAMES.light)).toBe(true);
    expect(document.documentElement.classList.contains(THEME_CLASS_NAMES.dark)).toBe(false);
  });
});
