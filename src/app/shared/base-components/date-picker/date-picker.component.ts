import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import type { FloatLabelType, MatFormFieldAppearance } from '@angular/material/form-field';
import { ComponentBase } from '@core/base/component-base';

@Component({
  selector: 'app-date-picker',
  standalone: false,
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClass()',
  },
})
export class DatePickerComponent extends ComponentBase {
  readonly control = input.required<FieldTree<Date | null, string>>();
  readonly labelText = input<string>('');
  readonly placeholder = input<string>('');
  readonly minDate = input<Date>();
  readonly maxDate = input<Date>();
  readonly supportingText = input<string>();
  readonly errorText = input<string>();
  readonly appearance = input<MatFormFieldAppearance>('outline');
  readonly floatLabel = input<FloatLabelType>('auto');
  readonly cssClass = input<string>('');

  protected readonly useTouchUi = signal<boolean>(false);

  readonly hasError = computed<boolean>(() => {
    const state = this.control()();
    return state.invalid() && state.touched();
  });

  readonly hostClass = computed<string>(() => {
    const classes = ['app-date-picker-host'];
    const css = this.cssClass();
    if (css) {
      classes.push(css);
    }
    return classes.join(' ');
  });

  constructor() {
    super();
    const breakpointObserver = inject(BreakpointObserver);
    breakpointObserver
      .observe('(max-width: 599px)')
      .pipe(this.takeUntilDestroyed())
      .subscribe((result) => {
        if (this.useTouchUi() !== result.matches) {
          this.useTouchUi.set(result.matches);
        }
      });
  }
}
