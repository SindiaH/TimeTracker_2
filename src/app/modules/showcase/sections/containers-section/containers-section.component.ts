import { ChangeDetectionStrategy, Component, input, InputSignal, signal, WritableSignal } from '@angular/core';
import { TRANSLATION_KEYS } from '@core/constants/translation-keys';

@Component({
  selector: 'app-containers-section',
  standalone: false,
  templateUrl: './containers-section.component.html',
  styleUrl: './containers-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContainersSectionComponent {
  readonly searchTerm: InputSignal<string | null> = input.required<string | null>();

  protected readonly translationKeys = TRANSLATION_KEYS;
  protected readonly keywords: ReadonlyArray<string> = [
    TRANSLATION_KEYS.showcase.sections.containers,
    'panel',
    'card',
    'accordion',
    'expansion',
    'editable',
    'akkordeon',
    'app-panel',
    'app-panel-editable',
    'app-accordion',
    'app-expansion-panel',
  ];

  protected readonly editingState: WritableSignal<boolean> = signal<boolean>(false);
}
