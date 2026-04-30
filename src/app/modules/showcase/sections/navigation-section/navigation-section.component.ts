import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { TRANSLATION_KEYS } from '@core/constants/translation-keys';
import { TabGroupType } from '@shared/types/tab-group.type';

@Component({
  selector: 'app-navigation-section',
  standalone: false,
  templateUrl: './navigation-section.component.html',
  styleUrl: './navigation-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationSectionComponent {
  readonly searchTerm: InputSignal<string | null> = input.required<string | null>();

  protected readonly translationKeys = TRANSLATION_KEYS;
  protected readonly keywords: ReadonlyArray<string> = [
    TRANSLATION_KEYS.showcase.sections.navigation,
    'tab',
    'menu',
    'navigation',
    'menü',
    'app-tab-group',
    'app-menu',
    'app-menu-item',
    'app-menu-link',
  ];

  protected readonly tabs: TabGroupType[] = [
    { label: 'Overview', active: true },
    { label: 'Details' },
    { label: 'Activity' },
    { label: 'History' },
  ];
}
