import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { ButtonToggleOption } from '@shared/base-components/button-toggle/button-toggle.type';

export type ButtonToggleValue = string | number | boolean | Array<string | number | boolean> | null | undefined;

@Component({
  selector: 'app-button-toggle',
  standalone: false,
  templateUrl: './button-toggle.component.html',
  styleUrl: './button-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonToggleComponent {
  readonly control = input.required<FormControl<ButtonToggleValue>>();
  readonly options = input.required<ButtonToggleOption[]>();
  readonly multiple = input<boolean>(false);
  readonly hideIndicator = input<boolean>(false);

  readonly optionChanged = output<ButtonToggleValue>();

  protected optionsChanged($event: MatButtonToggleChange): void {
    this.optionChanged.emit($event.value);
  }
}
