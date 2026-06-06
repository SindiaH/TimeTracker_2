import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { ComponentBase } from '@core/base/component-base';
import { TRANSLATION_KEYS } from '@core/constants/translation-keys';

@Component({
  selector: 'app-info-section',
  standalone: false,
  templateUrl: './info-section.component.html',
  styleUrl: './info-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoSectionComponent extends ComponentBase {
  readonly searchTerm: InputSignal<string | null> = input.required<string | null>();

  protected readonly keywords: ReadonlyArray<string> = [
    TRANSLATION_KEYS.showcase.sections.info,
    'info',
    'alert',
    'warning',
    'error',
    'success',
    'readonly',
    'hinweis',
    'app-info',
    'app-text-readonly',
  ];
}
