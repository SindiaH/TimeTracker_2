import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ListType } from '@shared/types/list.type';

export type ListSelectableValue = string[] | null | undefined;

@Component({
  selector: 'app-list-selectable',
  standalone: false,
  templateUrl: './list-selectable.component.html',
  styleUrl: './list-selectable.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListSelectableComponent {
  readonly control = input.required<FormControl<ListSelectableValue>>();
  readonly list = input.required<ListType[]>();
  readonly multiple = input<boolean>(false);

  readonly selectionChanged = output<ListSelectableValue>();

  protected onSelectionChanged(): void {
    this.selectionChanged.emit(this.control().value);
  }
}
