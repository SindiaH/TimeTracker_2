import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type InfoType = 'error' | 'info' | 'success' | 'warning' | 'primary';

@Component({
  selector: 'app-info',
  standalone: false,
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoComponent {
  readonly type = input<InfoType>('info');
  readonly hideIcon = input<boolean>(false);

  readonly icon = computed<string>(() => {
    switch (this.type()) {
      case 'error':
        return 'error';
      case 'success':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'primary':
      case 'info':
      default:
        return 'info';
    }
  });
}
