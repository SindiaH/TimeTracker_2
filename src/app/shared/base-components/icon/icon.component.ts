import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconBackgroundColor = '' | 'icon-info' | 'icon-success' | 'icon-warning' | 'icon-error';
export type IconSizeVariant = '' | 'icon-header-size';

@Component({
  selector: 'app-icon',
  standalone: false,
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  readonly outlined = input<boolean>(true);
  readonly backgroundColor = input<IconBackgroundColor>('');
  readonly iconSize = input<IconSizeVariant>('');
}
