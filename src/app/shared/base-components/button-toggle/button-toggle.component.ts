import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { ComponentBase } from '@core/base/component-base';
import { ButtonToggleOption } from '@shared/base-components/button-toggle/button-toggle.type';

export type ButtonToggleValue = string | number | boolean | Array<string | number | boolean> | null;

@Component({
  selector: 'app-button-toggle',
  standalone: false,
  templateUrl: './button-toggle.component.html',
  styleUrl: './button-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClass()',
  },
})
export class ButtonToggleComponent extends ComponentBase {
  readonly control = input.required<FieldTree<ButtonToggleValue, string>>();
  readonly options = input.required<ButtonToggleOption[]>();
  readonly multiple = input<boolean>(false);
  readonly hideIndicator = input<boolean>(false);
  readonly cssClass = input<string>('');

  readonly optionChanged = output<ButtonToggleValue>();

  readonly hostClass = computed<string>(() => {
    const classes = ['app-button-toggle-host'];
    const css = this.cssClass();
    if (css) {
      classes.push(css);
    }
    return classes.join(' ');
  });

  protected onChange($event: MatButtonToggleChange): void {
    this.optionChanged.emit($event.value);
  }
}
