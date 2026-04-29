import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-text-readonly',
  standalone: false,
  templateUrl: './text-readonly.component.html',
  styleUrl: './text-readonly.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextReadonlyComponent {
  readonly labelText = input<string | null>(null);
  readonly value = input<string | null>('-');
  readonly placeholder = input<string>('-');

  readonly valueToDisplay = computed<string>(() => {
    const value = this.value();
    return value && value.trim().length > 0 ? value : this.placeholder();
  });
}
