import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import type { FloatLabelType, MatFormFieldAppearance } from '@angular/material/form-field';
import { ComponentBase } from '@core/base/component-base';
import type { AppIcon } from '@core/constants/app-icons';
import { TranslationService } from '@core/i18n/translation.service';

export type InputType = 'text' | 'password' | 'email' | 'number' | 'textarea';

@Component({
  selector: 'app-input',
  standalone: false,
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClass()',
  },
})
export class InputComponent extends ComponentBase {
  private readonly i18n = inject(TranslationService);

  readonly control = input.required<FieldTree<string, string>>();
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly type = input<InputType>('text');
  readonly rows = input<number>(3);
  readonly isClearable = input<boolean>(false);

  readonly leadingIcon = input<AppIcon>();
  readonly trailingIcon = input<AppIcon>();
  readonly supportingText = input<string>();
  /** Optional override for the error message. When set, replaces the built-in resolution
   *  for `required` / `email` / `minLength` / `maxLength` / `min` / `max` / `pattern` —
   *  use this for custom error kinds (e.g. `mismatch`) or field-specific wording. */
  readonly errorText = input<string>();
  readonly appearance = input<MatFormFieldAppearance>('outline');
  readonly floatLabel = input<FloatLabelType>('auto');
  readonly cssClass = input<string>('');

  readonly cleared = output<void>();

  readonly canClear = computed<boolean>(() => this.isClearable() && !!this.control()().value());

  readonly hasError = computed<boolean>(() => {
    const state = this.control()();
    return state.invalid() && state.touched();
  });

  readonly resolvedErrorText = computed<string>(() => {
    if (!this.hasError()) {
      return '';
    }
    const override = this.errorText();
    if (override) {
      return override;
    }
    this.i18n.selectedLanguageId$();
    const state = this.control()();
    const keys = this.translationKeys.shared.formErrors;

    if (state.getError('required')) {
      return this.i18n.instant(keys.required);
    }
    if (state.getError('email')) {
      return this.i18n.instant(keys.email);
    }
    const minLen = state.getError('minLength');
    if (minLen) {
      return this.i18n.instant(keys.minLength, { count: minLen.minLength });
    }
    const maxLen = state.getError('maxLength');
    if (maxLen) {
      return this.i18n.instant(keys.maxLength, { count: maxLen.maxLength });
    }
    const min = state.getError('min');
    if (min) {
      return this.i18n.instant(keys.min, { min: min.min });
    }
    const max = state.getError('max');
    if (max) {
      return this.i18n.instant(keys.max, { max: max.max });
    }
    if (state.getError('pattern')) {
      return this.i18n.instant(keys.pattern);
    }
    return '';
  });

  readonly hostClass = computed<string>(() => {
    const classes = ['app-input-host'];
    const css = this.cssClass();
    if (css) {
      classes.push(css);
    }
    return classes.join(' ');
  });

  clear(): void {
    this.control()().value.set('');
    this.cleared.emit();
  }
}
