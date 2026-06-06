import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { ComponentBase } from '@core/base/component-base';
import { TRANSLATION_KEYS } from '@core/constants/translation-keys';

@Component({
  selector: 'app-pagination-section',
  standalone: false,
  templateUrl: './pagination-section.component.html',
  styleUrl: './pagination-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationSectionComponent extends ComponentBase {
  readonly searchTerm: InputSignal<string | null> = input.required<string | null>();

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
