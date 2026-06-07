import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { ComponentBase } from '@core/base/component-base';

export type CheckboxLabelPosition = 'before' | 'after';

@Component({
  selector: 'app-checkbox',
  standalone: false,
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClass()',
  },
})
export class CheckboxComponent extends ComponentBase {
  readonly control = input.required<FieldTree<boolean, string>>();
  readonly label = input<string>('');
  readonly ariaLabel = input<string>();
  readonly labelPosition = input<CheckboxLabelPosition>('after');
  readonly isIndeterminate = model<boolean>(false);
  readonly cssClass = input<string>('');

  readonly hasError = computed<boolean>(() => {
    const state = this.control()();
    return state.invalid() && state.touched();
  });

  readonly hostClass = computed<string>(() => {
    const classes = ['app-checkbox-host'];
    if (this.hasError()) {
      classes.push('app-checkbox-host--invalid');
    }
    const css = this.cssClass();
    if (css) {
      classes.push(css);
    }
    return classes.join(' ');
  });

  clearIndeterminate(): void {
    this.isIndeterminate.set(false);
  }
}
