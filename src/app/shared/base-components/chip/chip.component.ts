import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-chip',
  standalone: false,
  templateUrl: './chip.component.html',
  styleUrl: './chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipComponent {
  readonly avatarUrl = input<string | null>(null);
  readonly disabled = input<boolean>(false);
  readonly removable = input<boolean>(false);

  readonly removed = output<void>();
}
