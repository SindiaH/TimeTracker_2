import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ComponentBase } from '@core/base/component-base';

export type DatePickerAppearance = 'fill' | 'outline';

@Component({
  selector: 'app-date-picker',
  standalone: false,
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerComponent extends ComponentBase {
  readonly control = input.required<FormControl<Date | null>>();
  readonly labelText = input.required<string>();
  readonly placeholder = input<string | null>(null);
  readonly invalidErrorText = input<string>('Pflichtfeld');
  readonly disabled = input<boolean>(false);
  readonly hint = input<string | null>(null);
  readonly appearance = input<DatePickerAppearance>('outline');

  readonly dateChanged = output<Date | null>();

  protected readonly useTouchUi = signal<boolean>(false);

  constructor(breakpointObserver: BreakpointObserver) {
    super();
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
