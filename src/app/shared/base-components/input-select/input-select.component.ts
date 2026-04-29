import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
  untracked,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ComponentBase } from '@core/base/component-base';
import { ISelectItem } from '@shared/base-components/input-select/input-select.type';

export type InputSelectAppearance = 'fill' | 'outline';
export type InputSelectValue = string | string[] | number | number[] | null | undefined;

@Component({
  selector: 'app-input-select',
  standalone: false,
  templateUrl: './input-select.component.html',
  styleUrl: './input-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputSelectComponent extends ComponentBase implements OnInit, OnDestroy {
  readonly items = input.required<ISelectItem[]>();
  readonly labelText = input.required<string>();
  readonly control = input.required<FormControl<InputSelectValue>>();
  readonly showAsNumbered = input<boolean>(false);
  readonly appearance = input<InputSelectAppearance>('outline');
  readonly errorText = input<string | null>(null);
  readonly errorRequiredText = input<string>('Pflichtfeld');
  readonly hideErrorField = input<boolean>(false);
  readonly multiple = input<boolean>(false);
  readonly disableControl = input<boolean>(false);

  readonly changed = output<InputSelectValue>();
  readonly closed = output<void>();

  protected readonly changeSubject = new Subject<InputSelectValue>();
  protected readonly selectedItems = signal<ISelectItem[]>([]);
  protected readonly selectedItemsText = computed<string>(() => {
    return this.selectedItems()
      .map((item) => item.name ?? '')
      .join(', ');
  });

  constructor() {
    super();
    effect(() => {
      const value = this.control().value;
      const items = this.items();
      untracked(() => this.updateSelectedItems(value, items));
    });

    effect(() => {
      const disable = this.disableControl();
      const control = this.control();
      untracked(() => {
        if (disable && !control.disabled) {
          control.disable();
        } else if (!disable && control.disabled) {
          control.enable();
        }
      });
    });
  }

  ngOnInit(): void {
    this.changeSubject.pipe(debounceTime(200), distinctUntilChanged(), this.takeUntilDestroyed()).subscribe((value) => {
      this.changed.emit(value);
    });
    this.control()
      .valueChanges.pipe(this.takeUntilDestroyed())
      .subscribe((value) => {
        this.changeSubject.next(value);
        this.updateSelectedItems(value, this.items());
      });
  }

  ngOnDestroy(): void {
    this.changeSubject.complete();
  }

  private updateSelectedItems(value: InputSelectValue, items: ISelectItem[]): void {
    if (value == null || (Array.isArray(value) && value.length === 0)) {
      this.selectedItems.set([]);
      return;
    }
    const values = (Array.isArray(value) ? value : [value]).map((v) => String(v));
    const valueSet = new Set(values);
    this.selectedItems.set(items.filter((item) => item.id != null && valueSet.has(String(item.id))));
  }
}
