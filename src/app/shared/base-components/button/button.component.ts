import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type ButtonVariant = 'flat' | 'stroked' | 'icon';

@Component({
  selector: 'app-button',
  standalone: false,
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('flat');
  readonly icon = input<string | null>(null);
  readonly tooltip = input<string | null>(null);
  readonly loading = input<boolean>(false);
  readonly disabled = input<boolean>(false);

  readonly clicked = output<void>();
}
