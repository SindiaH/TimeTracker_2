import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ComponentBase } from '@core/base/component-base';

@Component({
  selector: 'app-list-item',
  standalone: false,
  templateUrl: './list-item.component.html',
  styleUrl: './list-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListItemComponent extends ComponentBase {
  readonly titleText = input.required<string>();
  readonly additionalLines = input<string[]>([]);
  readonly icon = input<string | null>(null);
  readonly showRemoveButton = input<boolean>(false);
  readonly removeTooltipText = input<string | null>(null);

  readonly clickEvent = output<void>();
  readonly removeClicked = output<void>();
}
