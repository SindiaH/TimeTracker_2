import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ComponentBase } from '@core/base/component-base';
import { TRANSLATION_KEYS } from '@core/constants/translation-keys';
import { InputValue } from '@shared/base-components/input/input.component';
import { InputSelectSearchValue } from '@shared/base-components/input-select-search/input-select-search.component';
import { InputSelectValue } from '@shared/base-components/input-select/input-select.component';
import { ISelectItem } from '@shared/base-components/input-select/input-select.type';
import { SearchValue } from '@shared/base-components/search/search.component';

@Component({
  selector: 'app-inputs-section',
  standalone: false,
  templateUrl: './inputs-section.component.html',
  styleUrl: './inputs-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputsSectionComponent extends ComponentBase {
  readonly searchTerm: InputSignal<string | null> = input.required<string | null>();

  protected readonly keywords: ReadonlyArray<string> = [
    TRANSLATION_KEYS.showcase.sections.inputs,
    'input',
    'text',
    'select',
    'autocomplete',
    'search',
    'eingabe',
    'auswahl',
    'suche',
    'app-input',
    'app-input-select',
    'app-input-select-search',
    'app-search',
  ];

  protected readonly textControl: FormControl<InputValue> = new FormControl<InputValue>('Hello world');
  protected readonly numberControl: FormControl<InputValue> = new FormControl<InputValue>(42);
  protected readonly passwordControl: FormControl<InputValue> = new FormControl<InputValue>('secret');
  protected readonly textareaControl: FormControl<InputValue> = new FormControl<InputValue>('Multi\nline\ntext');
  protected readonly disabledControl: FormControl<InputValue> = new FormControl<InputValue>({
    value: 'Disabled',
    disabled: true,
  });
  protected readonly readonlyControl: FormControl<InputValue> = new FormControl<InputValue>('Read-only');

  protected readonly selectItems: ISelectItem[] = [
    { id: 'tasks', name: 'Tasks', icon: 'check_circle' },
    { id: 'time', name: 'Time entries', icon: 'schedule' },
    { id: 'calendar', name: 'Calendar', icon: 'calendar_month' },
    { id: 'activities', name: 'Activities', icon: 'analytics' },
    { id: 'settings', name: 'Settings', icon: 'settings' },
  ];

  protected readonly singleSelectControl: FormControl<InputSelectValue> = new FormControl<InputSelectValue>('tasks');
  protected readonly multiSelectControl: FormControl<InputSelectValue> = new FormControl<InputSelectValue>([
    'tasks',
    'time',
  ]);
  protected readonly autocompleteControl: FormControl<InputSelectSearchValue> = new FormControl<InputSelectSearchValue>(
    null,
  );
  protected readonly searchControl: FormControl<SearchValue> = new FormControl<SearchValue>(null);
}
