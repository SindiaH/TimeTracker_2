import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { TRANSLATION_KEYS } from '@core/constants/translation-keys';

@Component({
  selector: 'app-buttons-section',
  standalone: false,
  templateUrl: './buttons-section.component.html',
  styleUrl: './buttons-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonsSectionComponent {
  readonly searchTerm: InputSignal<string | null> = input.required<string | null>();

  protected readonly translationKeys = TRANSLATION_KEYS;
  protected readonly keywords: ReadonlyArray<string> = [
    TRANSLATION_KEYS.showcase.sections.buttons,
    'button',
    'btn',
    'link',
    'icon',
    'fab',
    'app-button',
    'app-link',
    'app-icon',
  ];
}
