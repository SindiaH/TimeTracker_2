import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TRANSLATION_KEYS } from '@core/constants/translation-keys';
import { ButtonToggleValue } from '@shared/base-components/button-toggle/button-toggle.component';
import { ButtonToggleOption } from '@shared/base-components/button-toggle/button-toggle.type';
import { RadioButtonType } from '@shared/types/radio-button.type';

@Component({
  selector: 'app-toggles-section',
  standalone: false,
  templateUrl: './toggles-section.component.html',
  styleUrl: './toggles-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TogglesSectionComponent {
  readonly searchTerm: InputSignal<string | null> = input.required<string | null>();

  protected readonly translationKeys = TRANSLATION_KEYS;
  protected readonly keywords: ReadonlyArray<string> = [
    TRANSLATION_KEYS.showcase.sections.toggles,
    'checkbox',
    'toggle',
    'radio',
    'chip',
    'switch',
    'schalter',
    'auswahl',
    'app-checkbox',
    'app-toggle',
    'app-radio-button',
    'app-button-toggle',
    'app-chip',
  ];

  protected readonly checkboxControl: FormControl<boolean | null> = new FormControl<boolean | null>(true);
  protected readonly toggleControl: FormControl<boolean | null> = new FormControl<boolean | null>(false);

  protected readonly radioOptions: RadioButtonType[] = [
    { id: 'one', name: 'One' },
    { id: 'two', name: 'Two' },
    { id: 'three', name: 'Three' },
  ];
  protected readonly selectedRadio: string = 'two';

  protected readonly buttonToggleOptions: ButtonToggleOption[] = [
    { id: 'list', name: 'List', icon: 'view_list' },
    { id: 'grid', name: 'Grid', icon: 'grid_view' },
    { id: 'card', name: 'Card', icon: 'view_module' },
  ];
  protected readonly buttonToggleControl: FormControl<ButtonToggleValue> = new FormControl<ButtonToggleValue>('grid');
  protected readonly buttonToggleMultiControl: FormControl<ButtonToggleValue> = new FormControl<ButtonToggleValue>([
    'list',
    'grid',
  ]);
}
