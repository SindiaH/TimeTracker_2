import { ChangeDetectionStrategy, Component, computed, effect, inject, Signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ButtonToggleValue } from '@shared/base-components/button-toggle/button-toggle.component';
import { ButtonToggleOption } from '@shared/base-components/button-toggle/button-toggle.type';
import { ComponentBase } from '@core/base/component-base';
import { ThemeService } from '@core/services/theme/theme.service';
import { ThemePreference } from '@core/services/theme/theme.type';

@Component({
  selector: 'app-shared-header',
  standalone: false,
  templateUrl: './shared-header.component.html',
  styleUrl: './shared-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedHeaderComponent extends ComponentBase {
  private readonly themeService = inject(ThemeService);

  protected readonly theme: Signal<ThemePreference> = this.themeService.theme;

  protected readonly themeControl: FormControl<ButtonToggleValue> = new FormControl<ButtonToggleValue>(
    this.themeService.theme(),
  );

  protected readonly themeOptions: Signal<ButtonToggleOption[]> = computed<ButtonToggleOption[]>(() => [
    { id: 'light', name: '', icon: 'light_mode' },
    { id: 'dark', name: '', icon: 'dark_mode' },
  ]);

  constructor() {
    super();

    effect(() => {
      const preference = this.theme();
      if (this.themeControl.value !== preference) {
        this.themeControl.setValue(preference, { emitEvent: false });
      }
    });
  }

  protected onThemeChanged(value: ButtonToggleValue): void {
    if (this.isThemePreference(value)) {
      this.themeService.setTheme(value);
    }
  }

  private isThemePreference(value: ButtonToggleValue): value is ThemePreference {
    return value === 'light' || value === 'dark' || value === 'system';
  }
}
