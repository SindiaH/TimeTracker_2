import { ChangeDetectionStrategy, Component, input, InputSignal, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { ComponentBase } from '@core/base/component-base';
import { APP_ICONS } from '@core/constants/app-icons';
import { TRANSLATION_KEYS } from '@core/constants/translation-keys';
import { ListType } from '@shared/types/list.type';

type ListSelectableShowcaseModel = {
  single: string[];
  multi: string[];
};

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
    { title: 'Tasks', lines: ['Track your work'], icon: APP_ICONS.success },
    { title: 'Time entries', lines: ['Recorded sessions', 'Including today'], icon: APP_ICONS.time },
    { title: 'Calendar', lines: ['Daily overview'], icon: APP_ICONS.navCalendar },
  ];

  protected readonly selectableItems: ListType[] = [
    { id: 'tauri', name: 'Tauri' },
    { id: 'angular', name: 'Angular' },
    { id: 'supabase', name: 'Supabase' },
    { id: 'material', name: 'Material' },
  ];

  protected readonly selectionModel = signal<ListSelectableShowcaseModel>({
    single: ['angular'],
    multi: ['tauri', 'angular'],
  });
  protected readonly selectionForm = form(this.selectionModel);
}
