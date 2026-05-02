import { ChangeDetectionStrategy, Component, effect, input, OnDestroy, output, signal, untracked } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { ComponentBase } from '@core/base/component-base';
import { controlErrorKeys } from '@core/utils/control-error-keys';

export type DateRangePickerAppearance = 'fill' | 'outline';

export type DateRange = {
  start: Date | null | undefined;
  end: Date | null | undefined;
};

type DateRangeFormGroup = {
  start: FormControl<Date | null>;
  end: FormControl<Date | null>;
};

@Component({
  selector: 'app-date-range-picker',
  standalone: false,
  templateUrl: './date-range-picker.component.html',
  styleUrl: './date-range-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateRangePickerComponent extends ComponentBase implements OnDestroy {
  readonly startControl = input.required<FormControl<Date | null>>();
  readonly endControl = input.required<FormControl<Date | null>>();
  readonly labelText = input.required<string>();
  readonly placeholder = input<string | null>(null);
  readonly invalidErrorText = input<string>('Pflichtfeld');
  readonly minDateErrorText = input<string>('Datum ungültig');
  readonly disabled = input<boolean>(false);
  readonly hint = input<string | null>(null);
  readonly appearance = input<DateRangePickerAppearance>('outline');
  readonly minStartDate = input<Date | null>(null);
  readonly fromLabel = input<string>('Von');
  readonly toLabel = input<string>('Bis');

  readonly dateChanged = output<DateRange>();

  protected readonly useTouchUi = signal<boolean>(false);
  protected readonly formGroup = signal<FormGroup<DateRangeFormGroup> | null>(null);
  protected readonly startErrorKeys = controlErrorKeys(this.startControl);
  private formGroupSubscription: Subscription | undefined;

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

    effect(() => {
      const disabled = this.disabled();
      const group = this.formGroup();
      untracked(() => {
        if (!group) return;
        if (disabled && !group.disabled) {
          group.disable();
        } else if (!disabled && group.disabled) {
          group.enable();
        }
      });
    });

    effect(() => {
      const start = this.startControl();
      const end = this.endControl();
      const group = new FormGroup<DateRangeFormGroup>({ start, end });
      this.formGroup.set(group);

      this.formGroupSubscription?.unsubscribe();
      this.formGroupSubscription = group.valueChanges
        .pipe(
          debounceTime(500),
          distinctUntilChanged((prev, curr) => prev.start === curr.start && prev.end === curr.end),
        )
        .subscribe((value) => this.dateChanged.emit({ start: value.start, end: value.end }));
    });
  }

  ngOnDestroy(): void {
    this.formGroupSubscription?.unsubscribe();
  }

  triggerDateValidation(): void {
    this.formGroup()?.markAllAsTouched();
  }
}
