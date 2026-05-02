import { ChangeDetectionStrategy, Component, computed, input, output, Signal } from '@angular/core';
import { ComponentBase } from '@core/base/component-base';

export type ButtonVariant = 'basic' | 'raised' | 'flat' | 'stroked' | 'icon' | 'fab' | 'extended-fab';

@Component({
  selector: 'app-button',
  standalone: false,
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent extends ComponentBase {
  readonly variant = input<ButtonVariant>('flat');
  readonly icon = input<string | null>(null);
  readonly tooltip = input<string | null>(null);
  readonly loading = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly outlined = input<boolean>(true);

  readonly clicked = output<void>();

  readonly isInteractionBlocked: Signal<boolean> = computed<boolean>(() => this.disabled() || this.loading());
}
