import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import type { FloatLabelType, MatFormFieldAppearance } from '@angular/material/form-field';
import { ComponentBase } from '@core/base/component-base';
import type { AppIcon } from '@core/constants/app-icons';

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
  readonly control = input.required<FieldTree<string, string>>();
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly type = input<InputType>('text');
  readonly rows = input<number>(3);
  readonly isClearable = input<boolean>(false);

  readonly leadingIcon = input<AppIcon>();
  readonly trailingIcon = input<AppIcon>();
  readonly supportingText = input<string>();
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
