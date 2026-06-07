import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import type { FloatLabelType, MatFormFieldAppearance } from '@angular/material/form-field';
import { ComponentBase } from '@core/base/component-base';

export type DateRangeValue = {
  start: Date | null;
  end: Date | null;
};

@Component({
  selector: 'app-date-range-picker',
  standalone: false,
  templateUrl: './date-range-picker.component.html',
  styleUrl: './date-range-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClass()',
  },
})
export class DateRangePickerComponent extends ComponentBase {
  readonly control = input.required<FieldTree<DateRangeValue, string>>();
  readonly labelText = input<string>('');
  readonly fromLabel = input<string>('');
  readonly toLabel = input<string>('');
  readonly minDate = input<Date>();
  readonly maxDate = input<Date>();
  readonly supportingText = input<string>();
  readonly errorText = input<string>();
  readonly appearance = input<MatFormFieldAppearance>('outline');
  readonly floatLabel = input<FloatLabelType>('auto');
  readonly cssClass = input<string>('');

  protected readonly useTouchUi = signal<boolean>(false);

  readonly hasError = computed<boolean>(() => {
    const root = this.control();
    const start = root.start();
    const end = root.end();
    return (start.invalid() && start.touched()) || (end.invalid() && end.touched());
  });

  readonly hostClass = computed<string>(() => {
    const classes = ['app-date-range-picker-host'];
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
