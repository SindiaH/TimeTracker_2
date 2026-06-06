import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ComponentBase } from '@core/base/component-base';

@Component({
  selector: 'app-chip',
  standalone: false,
  templateUrl: './chip.component.html',
  styleUrl: './chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipComponent extends ComponentBase {
  readonly avatarUrl = input<string | null>(null);
  readonly disabled = input<boolean>(false);
  readonly removable = input<boolean>(false);

  readonly removed = output<void>();
}
