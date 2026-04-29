import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type MenuLinkTarget = '_blank' | '_self' | '_parent' | '_top';

@Component({
  selector: 'app-menu-link',
  standalone: false,
  templateUrl: './menu-link.component.html',
  styleUrl: './menu-link.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuLinkComponent {
  readonly tooltip = input<string | null>(null);
  readonly disabled = input<boolean>(false);
  readonly icon = input<string | null>(null);
  readonly href = input<string | null>(null);
  readonly fragment = input<string | undefined>(undefined);
  readonly target = input<MenuLinkTarget>('_self');
  readonly externalLink = input<boolean>(false);
}
