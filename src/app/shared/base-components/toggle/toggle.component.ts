import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { ComponentBase } from '@core/base/component-base';

export type ToggleLabelPosition = 'before' | 'after';

@Component({
  selector: 'app-toggle',
  standalone: false,
  templateUrl: './toggle.component.html',
  styleUrl: './toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClass()',
  },
})
export class ToggleComponent extends ComponentBase {
  readonly control = input.required<FieldTree<boolean, string>>();
  readonly label = input<string>('');
  readonly ariaLabel = input<string>();
  readonly labelPosition = input<ToggleLabelPosition>('after');
  readonly cssClass = input<string>('');

  readonly hostClass = computed<string>(() => {
    const classes = ['app-toggle-host'];
    if (this.control()().value()) {
      classes.push('app-toggle-host--checked');
    }
    const css = this.cssClass();
    if (css) {
      classes.push(css);
    }
    return classes.join(' ');
  });
}
