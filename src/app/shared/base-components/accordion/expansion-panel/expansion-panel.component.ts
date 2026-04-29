import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { StepperService } from '@shared/base-components/accordion/stepper.service';

@Component({
  selector: 'app-expansion-panel',
  standalone: false,
  templateUrl: './expansion-panel.component.html',
  styleUrl: './expansion-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpansionPanelComponent {
  readonly titleText = input.required<string>();
  readonly descriptionText = input<string | null>(null);
  readonly disabled = input<boolean>(false);
  readonly expanded = input<boolean>(false);
  readonly hideToggle = input<boolean>(false);
  readonly stepperService = input<StepperService | null>(null);
  readonly step = input<number | null>(null);
  readonly previousLabel = input<string>('Zurück');
  readonly nextLabel = input<string>('Weiter');
  readonly closeLabel = input<string>('Schließen');

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
