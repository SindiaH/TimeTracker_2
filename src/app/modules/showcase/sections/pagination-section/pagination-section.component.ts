import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { TRANSLATION_KEYS } from '@core/constants/translation-keys';

@Component({
  selector: 'app-pagination-section',
  standalone: false,
  templateUrl: './pagination-section.component.html',
  styleUrl: './pagination-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationSectionComponent {
  readonly searchTerm: InputSignal<string | null> = input.required<string | null>();

  protected readonly translationKeys = TRANSLATION_KEYS;
  protected readonly keywords: ReadonlyArray<string> = [
    TRANSLATION_KEYS.showcase.sections.pagination,
    'paginator',
    'pagination',
    'load more',
    'progress',
    'spinner',
    'fortschritt',
    'app-paginator',
    'app-load-more',
    'app-progress-indicator',
  ];
}
