import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ComponentBase } from '@core/base/component-base';
import { TRANSLATION_KEYS, TranslationKey } from '@core/constants/translation-keys';
import { StepperService } from '@shared/base-components/accordion/stepper.service';

@Component({
  selector: 'app-expansion-panel',
  standalone: false,
  templateUrl: './expansion-panel.component.html',
  styleUrl: './expansion-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpansionPanelComponent extends ComponentBase {
  readonly titleText = input.required<string>();
  readonly descriptionText = input<string | null>(null);
  readonly disabled = input<boolean>(false);
  readonly expanded = input<boolean>(false);
  readonly hideToggle = input<boolean>(false);
  readonly stepperService = input<StepperService | null>(null);
  readonly step = input<number | null>(null);
  readonly previousLabelKey = input<TranslationKey>(TRANSLATION_KEYS.shared.previous);
  readonly nextLabelKey = input<TranslationKey>(TRANSLATION_KEYS.shared.next);
  readonly closeLabelKey = input<TranslationKey>(TRANSLATION_KEYS.shared.close);

  readonly opened = output<void>();

  protected readonly isExpanded = computed<boolean>(() => {
    const stepper = this.stepperService();
    return stepper ? stepper.step() === this.step() : this.expanded();
  });

  protected onOpened(): void {
    this.opened.emit();
    const step = this.step();
    if (step != null) {
      this.stepperService()?.setStep(step);
    }
  }
}
