import { ChangeDetectionStrategy, Component, input, InputSignal, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { disabled, form } from '@angular/forms/signals';
import { ComponentBase } from '@core/base/component-base';
import { APP_ICONS } from '@core/constants/app-icons';
import { TRANSLATION_KEYS } from '@core/constants/translation-keys';
import { ButtonToggleValue } from '@shared/base-components/button-toggle/button-toggle.component';
import { ButtonToggleOption } from '@shared/base-components/button-toggle/button-toggle.type';
import { RadioButtonType } from '@shared/types/radio-button.type';

type CheckboxShowcaseModel = {
  checked: boolean;
  unchecked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  labelBefore: boolean;
};

@Component({
  selector: 'app-toggles-section',
  standalone: false,
  templateUrl: './toggles-section.component.html',
  styleUrl: './toggles-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TogglesSectionComponent extends ComponentBase {
  readonly searchTerm: InputSignal<string | null> = input.required<string | null>();

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

  protected readonly checkboxModel = signal<CheckboxShowcaseModel>({
    checked: true,
    unchecked: false,
    indeterminate: true,
    disabled: true,
    labelBefore: true,
  });
  protected readonly checkboxForm = form(this.checkboxModel, (f) => {
    disabled(f.disabled);
  });

  protected readonly toggleControl: FormControl<boolean | null> = new FormControl<boolean | null>(false);

  protected readonly radioOptions: RadioButtonType[] = [
    { id: 'one', name: 'One' },
    { id: 'two', name: 'Two' },
    { id: 'three', name: 'Three' },
  ];
  protected readonly selectedRadio: string = 'two';

  protected readonly buttonToggleOptions: ButtonToggleOption[] = [
    { id: 'list', name: 'List', icon: APP_ICONS.viewList },
    { id: 'grid', name: 'Grid', icon: APP_ICONS.viewGrid },
    { id: 'card', name: 'Card', icon: APP_ICONS.viewCard },
  ];
  protected readonly buttonToggleControl: FormControl<ButtonToggleValue> = new FormControl<ButtonToggleValue>('grid');
  protected readonly buttonToggleMultiControl: FormControl<ButtonToggleValue> = new FormControl<ButtonToggleValue>([
    'list',
    'grid',
  ]);
}
