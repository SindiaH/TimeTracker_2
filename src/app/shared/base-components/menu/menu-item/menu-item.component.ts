import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-menu-item',
  standalone: false,
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemComponent {
  readonly tooltip = input<string | null>(null);
  readonly disabled = input<boolean>(false);
  readonly icon = input<string | null>(null);
  readonly pushIconToRight = input<boolean>(false);

  readonly clicked = output<void>();
}
