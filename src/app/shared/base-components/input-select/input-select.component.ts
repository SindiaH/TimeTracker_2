import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import type { FloatLabelType, MatFormFieldAppearance } from '@angular/material/form-field';
import { ComponentBase } from '@core/base/component-base';
import { ISelectItem } from '@shared/base-components/input-select/input-select.type';

export type InputSelectValue = string | string[] | number | number[] | null;

@Component({
  selector: 'app-input-select',
  standalone: false,
  templateUrl: './input-select.component.html',
  styleUrl: './input-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClass()',
  },
})
export class InputSelectComponent extends ComponentBase {
  readonly items = input.required<ISelectItem[]>();
  readonly control = input.required<FieldTree<InputSelectValue, string>>();
  readonly labelText = input<string>('');
  readonly placeholder = input<string>('');
  readonly showAsNumbered = input<boolean>(false);
  readonly multiple = input<boolean>(false);
  readonly appearance = input<MatFormFieldAppearance>('outline');
  readonly floatLabel = input<FloatLabelType>('auto');
  readonly errorText = input<string>();
  readonly hideErrorField = input<boolean>(false);
  readonly cssClass = input<string>('');

  readonly closed = output<void>();

  readonly hasError = computed<boolean>(() => {
    const state = this.control()();
    return state.invalid() && state.touched();
  });

  readonly selectedItems = computed<ISelectItem[]>(() => {
    const value = this.control()().value();
    if (value == null || (Array.isArray(value) && value.length === 0)) {
      return [];
    }
    const values = (Array.isArray(value) ? value : [value]).map((v) => String(v));
    const valueSet = new Set(values);
    return this.items().filter((item) => item.id != null && valueSet.has(String(item.id)));
  });

  readonly selectedItemsText = computed<string>(() =>
    this.selectedItems()
      .map((item) => item.name ?? '')
      .join(', '),
  );

  readonly hostClass = computed<string>(() => {
    const classes = ['app-input-select-host'];
    const css = this.cssClass();
    if (css) {
      classes.push(css);
    }
    return classes.join(' ');
  });
}
