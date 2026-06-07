import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { ComponentBase } from '@core/base/component-base';

@Component({
  selector: 'app-search',
  standalone: false,
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClass()',
  },
})
export class SearchComponent extends ComponentBase {
  readonly control = input.required<FieldTree<string, string>>();
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly cssClass = input<string>('');

  readonly searchChanged = output<string>();

  readonly canClear = computed<boolean>(() => !!this.control()().value());

  readonly hostClass = computed<string>(() => {
    const classes = ['app-search-host'];
    const css = this.cssClass();
    if (css) {
      classes.push(css);
    }
    return classes.join(' ');
  });

  onEnter(): void {
    this.searchChanged.emit(this.control()().value());
  }

  clear(): void {
    this.control()().value.set('');
    this.searchChanged.emit('');
  }
}
