import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ComponentBase } from '@core/base/component-base';
import { TRANSLATION_KEYS } from '@core/constants/translation-keys';

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

  protected readonly singleDateControl: FormControl<Date | null> = new FormControl<Date | null>(new Date());
  protected readonly disabledDateControl: FormControl<Date | null> = new FormControl<Date | null>({
    value: new Date(),
    disabled: true,
  });
  protected readonly rangeStartControl: FormControl<Date | null> = new FormControl<Date | null>(new Date());
  protected readonly rangeEndControl: FormControl<Date | null> = new FormControl<Date | null>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  );
}
