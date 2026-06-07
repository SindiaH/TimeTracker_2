import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { ComponentBase } from '@core/base/component-base';
import { RadioButtonType } from '@shared/types/radio-button.type';

export type RadioButtonAlignment = 'row' | 'column';
export type RadioButtonValue = string | number | null;

@Component({
  selector: 'app-radio-button',
  standalone: false,
  templateUrl: './radio-button.component.html',
  styleUrl: './radio-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioButtonComponent extends ComponentBase {
  readonly control = input.required<FieldTree<RadioButtonValue, string>>();
  readonly radioValues = input.required<RadioButtonType[]>();
  readonly name = input<string>('');
  readonly alignItems = input<RadioButtonAlignment>('row');

  readonly groupClass = computed<string>(() => 'app-radio-button align-' + this.alignItems());
}
