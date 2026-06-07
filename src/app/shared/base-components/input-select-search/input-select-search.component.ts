import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import type { FloatLabelType, MatFormFieldAppearance } from '@angular/material/form-field';
import { ComponentBase } from '@core/base/component-base';
import { ISelectItem } from '@shared/base-components/input-select/input-select.type';

export type InputSelectSearchValue = string | number | null;

@Component({
  selector: 'app-input-select-search',
  standalone: false,
  templateUrl: './input-select-search.component.html',
  styleUrl: './input-select-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClass()',
  },
})
export class InputSelectSearchComponent extends ComponentBase {
  readonly items = input.required<ISelectItem[]>();
  readonly control = input.required<FieldTree<InputSelectSearchValue, string>>();
  readonly labelText = input<string>('');
  readonly placeholder = input<string>('');
  readonly appearance = input<MatFormFieldAppearance>('outline');
  readonly floatLabel = input<FloatLabelType>('auto');
  readonly errorText = input<string>();
  readonly isClearable = input<boolean>(true);
  readonly cssClass = input<string>('');

  readonly cleared = output<void>();

  private readonly query = signal<string>('');

  readonly filteredOptions = computed<ISelectItem[]>(() => {
    const query = this.query().trim().toLowerCase();
    if (!query) {
      return this.items();
    }
    return this.items().filter((item) => (item.name ?? '').toLowerCase().includes(query));
  });

  readonly canClear = computed<boolean>(() => this.isClearable() && this.control()().value() != null);

  readonly hasError = computed<boolean>(() => {
    const state = this.control()();
    return state.invalid() && state.touched();
  });

  readonly hostClass = computed<string>(() => {
    const classes = ['app-input-select-search-host'];
    const css = this.cssClass();
    if (css) {
      classes.push(css);
    }
    return classes.join(' ');
  });

  readonly displayWith = (value: InputSelectSearchValue): string => {
    if (value == null) {
      return '';
    }
    return this.items().find((item) => item.id === value)?.name ?? '';
  };

  onInput(text: string): void {
    this.query.set(text);
  }

  onClosed(): void {
    this.query.set('');
  }

  clear(): void {
    const state = this.control()();
    state.value.set(null);
    state.markAsTouched();
    this.query.set('');
    this.cleared.emit();
  }
}
