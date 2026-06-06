import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ComponentBase } from '@core/base/component-base';
import { TRANSLATION_KEYS } from '@core/constants/translation-keys';
import { ListSelectableValue } from '@shared/base-components/list-selectable/list-selectable.component';
import { ListType } from '@shared/types/list.type';

@Component({
  selector: 'app-lists-section',
  standalone: false,
  templateUrl: './lists-section.component.html',
  styleUrl: './lists-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListsSectionComponent extends ComponentBase {
  readonly searchTerm: InputSignal<string | null> = input.required<string | null>();

  protected readonly keywords: ReadonlyArray<string> = [
    TRANSLATION_KEYS.showcase.sections.lists,
    'list',
    'liste',
    'item',
    'selectable',
    'app-list',
    'app-list-item',
    'app-list-selectable',
  ];

  protected readonly listItems: { title: string; lines: string[]; icon: string }[] = [
    { title: 'Tasks', lines: ['Track your work'], icon: 'check_circle' },
    { title: 'Time entries', lines: ['Recorded sessions', 'Including today'], icon: 'schedule' },
    { title: 'Calendar', lines: ['Daily overview'], icon: 'calendar_month' },
  ];

  protected readonly selectableItems: ListType[] = [
    { id: 'tauri', name: 'Tauri' },
    { id: 'angular', name: 'Angular' },
    { id: 'supabase', name: 'Supabase' },
    { id: 'material', name: 'Material' },
  ];

  protected readonly singleSelectionControl: FormControl<ListSelectableValue> = new FormControl<ListSelectableValue>([
    'angular',
  ]);
  protected readonly multiSelectionControl: FormControl<ListSelectableValue> = new FormControl<ListSelectableValue>([
    'tauri',
    'angular',
  ]);
}
