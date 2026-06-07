import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { ComponentBase } from '@core/base/component-base';
import { ListType } from '@shared/types/list.type';

@Component({
  selector: 'app-list-selectable',
  standalone: false,
  templateUrl: './list-selectable.component.html',
  styleUrl: './list-selectable.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClass()',
  },
})
export class ListSelectableComponent extends ComponentBase {
  readonly control = input.required<FieldTree<string[], string>>();
  readonly list = input.required<ListType[]>();
  readonly multiple = input<boolean>(false);
  readonly cssClass = input<string>('');

  readonly hostClass = computed<string>(() => {
    const classes = ['app-list-selectable-host'];
    const css = this.cssClass();
    if (css) {
      classes.push(css);
    }
    return classes.join(' ');
  });
}
