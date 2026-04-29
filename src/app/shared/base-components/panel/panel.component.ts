import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatCardAppearance } from '@angular/material/card';

export type PanelAppearance = MatCardAppearance | 'custom-outlined';

@Component({
  selector: 'app-panel',
  standalone: false,
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelComponent {
  readonly titleText = input<string | null>(null);
  readonly subTitleText = input<string | null>(null);
  readonly appearance = input<PanelAppearance>('raised');
  readonly hasHoverEffect = input<boolean>(false);
  readonly hideFooter = input<boolean>(false);

  readonly matAppearance = computed<MatCardAppearance | null>(() => {
    const appearance = this.appearance();
    switch (appearance) {
      case 'outlined':
      case 'filled':
      case 'raised':
        return appearance;
      default:
        return null;
    }
  });
}
