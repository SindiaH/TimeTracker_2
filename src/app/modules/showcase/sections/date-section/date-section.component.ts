import { ChangeDetectionStrategy, Component, input, InputSignal, signal } from '@angular/core';
import { disabled, form } from '@angular/forms/signals';
import { ComponentBase } from '@core/base/component-base';
import { TRANSLATION_KEYS } from '@core/constants/translation-keys';
import { DateRangeValue } from '@shared/base-components/date-range-picker/date-range-picker.component';

type DatePickerShowcaseModel = {
  single: Date | null;
  disabled: Date | null;
};

type DateRangeShowcaseModel = {
  range: DateRangeValue;
};

@Component({
  selector: 'app-date-section',
  standalone: false,
  templateUrl: './date-section.component.html',
  styleUrl: './date-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateSectionComponent extends ComponentBase {
  readonly searchTerm: InputSignal<string | null> = input.required<string | null>();

  protected readonly keywords: ReadonlyArray<string> = [
    TRANSLATION_KEYS.showcase.sections.date,
    'date',
    'datum',
    'picker',
    'range',
    'kalender',
    'app-date-picker',
    'app-date-range-picker',
  ];

  protected readonly datePickerModel = signal<DatePickerShowcaseModel>({
    single: new Date(),
    disabled: new Date(),
  });
  protected readonly datePickerForm = form(this.datePickerModel, (f) => {
    disabled(f.disabled);
  });

  protected readonly dateRangeModel = signal<DateRangeShowcaseModel>({
    range: {
      start: new Date(),
      end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  protected readonly dateRangeForm = form(this.dateRangeModel);
}
