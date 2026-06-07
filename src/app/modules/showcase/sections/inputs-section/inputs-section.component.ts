import { ChangeDetectionStrategy, Component, input, InputSignal, signal } from '@angular/core';
import { disabled, form, readonly } from '@angular/forms/signals';
import { ComponentBase } from '@core/base/component-base';
import { APP_ICONS } from '@core/constants/app-icons';
import { TRANSLATION_KEYS } from '@core/constants/translation-keys';
import { InputSelectSearchValue } from '@shared/base-components/input-select-search/input-select-search.component';
import { InputSelectValue } from '@shared/base-components/input-select/input-select.component';
import { ISelectItem } from '@shared/base-components/input-select/input-select.type';

type SelectShowcaseModel = {
  single: InputSelectValue;
  multi: InputSelectValue;
};

type AutocompleteShowcaseModel = {
  selected: InputSelectSearchValue;
};

type InputShowcaseModel = {
  text: string;
  number: string;
  password: string;
  textarea: string;
  email: string;
  disabled: string;
  readonly: string;
};

type SearchShowcaseModel = {
  query: string;
};

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

  protected readonly inputModel = signal<InputShowcaseModel>({
    text: 'Hello world',
    number: '42',
    password: 'secret',
    textarea: 'Multi\nline\ntext',
    email: 'user@example.com',
    disabled: 'Disabled',
    readonly: 'Read-only',
  });

  protected readonly inputForm = form(this.inputModel, (f) => {
    disabled(f.disabled);
    readonly(f.readonly);
  });

  protected readonly selectItems: ISelectItem[] = [
    { id: 'tasks', name: 'Tasks', icon: APP_ICONS.navTasks },
    { id: 'time', name: 'Time entries', icon: APP_ICONS.navTimeEntries },
    { id: 'calendar', name: 'Calendar', icon: APP_ICONS.navCalendar },
    { id: 'activities', name: 'Activities', icon: APP_ICONS.navActivities },
    { id: 'settings', name: 'Settings', icon: APP_ICONS.navSettings },
  ];

  protected readonly selectModel = signal<SelectShowcaseModel>({
    single: 'tasks',
    multi: ['tasks', 'time'],
  });
  protected readonly selectForm = form(this.selectModel);

  protected readonly autocompleteModel = signal<AutocompleteShowcaseModel>({ selected: null });
  protected readonly autocompleteForm = form(this.autocompleteModel);

  protected readonly searchModel = signal<SearchShowcaseModel>({ query: '' });
  protected readonly searchForm = form(this.searchModel);
}
