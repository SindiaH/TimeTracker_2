import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type MenuAppearance = 'default' | 'filled';

@Component({
  selector: 'app-menu',
  standalone: false,
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  readonly icon = input<string | null>(null);
  readonly labelText = input<string | null>(null);
  readonly appearance = input<MenuAppearance>('default');
}
