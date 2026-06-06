import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { ComponentBase } from '@core/base/component-base';
import { PanelAppearance } from '@shared/base-components/panel/panel.component';

@Component({
  selector: 'app-panel-editable',
  standalone: false,
  templateUrl: './panel-editable.component.html',
  styleUrl: './panel-editable.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelEditableComponent extends ComponentBase {
  readonly titleText = input<string | null>(null);
  readonly subTitleText = input<string | null>(null);
  readonly appearance = input<PanelAppearance>('raised');
  readonly hasHoverEffect = input<boolean>(false);

  readonly loading = input<boolean>(false);
  readonly loadingButtons = input<boolean>(false);
  readonly editingAllowed = input<boolean>(true);
  readonly saveDisabled = input<boolean>(false);
  readonly editing = model<boolean>(false);
  readonly discardButtonText = input<string>('Verwerfen');
  readonly saveButtonText = input<string>('Speichern');
  readonly editButtonText = input<string>('Bearbeiten');

  readonly discardAction = output<void>();
  readonly saveAction = output<void>();
  readonly editAction = output<void>();

  protected save(): void {
    this.editing.set(false);
    this.saveAction.emit();
  }

  protected discard(): void {
    this.editing.set(false);
    this.discardAction.emit();
  }

  protected edit(): void {
    this.editing.set(true);
    this.editAction.emit();
  }
}
