import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { RadioButtonType } from '@shared/types/radio-button.type';

export type RadioButtonAlignment = 'row' | 'column';

@Component({
  selector: 'app-radio-button',
  standalone: false,
  templateUrl: './radio-button.component.html',
  styleUrl: './radio-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioButtonComponent {
  readonly radioValues = input.required<RadioButtonType[]>();
  readonly selectedValue = input.required<string | number>();
  readonly alignItems = input<RadioButtonAlignment>('row');

  readonly changed = output<string | number>();

  protected valueChanged($event: MatRadioChange): void {
    this.changed.emit($event.value);
  }
}
