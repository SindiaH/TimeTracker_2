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
import { FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ComponentBase } from '@core/base/component-base';
import { FORM_ERROR_CODES } from '@core/constants/form-error-codes';
import { controlErrorKeys } from '@core/utils/control-error-keys';
import { ISelectItem } from '@shared/base-components/input-select/input-select.type';

export type InputSelectSearchAppearance = 'fill' | 'outline';
export type InputSelectSearchValue = string | number | null | undefined;

@Component({
  selector: 'app-input-select-search',
  standalone: false,
  templateUrl: './input-select-search.component.html',
  styleUrl: './input-select-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputSelectSearchComponent extends ComponentBase implements OnInit, OnDestroy {
  readonly items = input.required<ISelectItem[]>();
  readonly labelText = input.required<string>();
  readonly control = input.required<FormControl<InputSelectSearchValue>>();
  readonly appearance = input<InputSelectSearchAppearance>('outline');
  readonly errorText = input<string | null>(null);
  readonly errorRequiredText = input<string>('Pflichtfeld');
  readonly hideClearButton = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly hasMore = input<boolean>(false);
  readonly loadingMore = input<boolean>(false);
  readonly loadMoreText = input<string>('Mehr laden');
  readonly disableClientFilter = input<boolean>(false);

  readonly changed = output<InputSelectSearchValue>();
  readonly searchChanged = output<string | null>();
  readonly loadMore = output<void>();

  protected readonly selectedItem = signal<ISelectItem | null>(null);
  protected readonly searchControl = new FormControl<InputSelectSearchValue>(null);
  private readonly searchControlSignal = signal<FormControl<InputSelectSearchValue>>(this.searchControl);
  protected readonly errorKeys = controlErrorKeys(this.searchControlSignal);
  protected readonly formErrorCodes = FORM_ERROR_CODES;
  private readonly changeSubject = new Subject<InputSelectSearchValue>();
  private readonly searchTerm = signal<string | null>(null);

  protected readonly filteredOptions = computed<ISelectItem[]>(() => {
    if (this.disableClientFilter()) {
      return this.items();
    }
    const term = (this.searchTerm() ?? '').toLowerCase();
    return this.items().filter((option) => (option.name ?? '').toLowerCase().includes(term));
  });

  protected readonly required = computed<boolean>(() => {
    const control = this.control();
    return control.validator ? (control.hasValidator(Validators.required) ?? false) : false;
  });

  constructor() {
    super();

    effect(() => {
      const value = this.control().value;
      const items = this.items();
      untracked(() => {
        const selected = items.find((item) => item.id == value) ?? null;
        this.selectedItem.set(selected);
        if (this.searchTerm() === null) {
          this.searchControl.setValue(selected?.id ?? null);
        }
      });
    });

    effect(() => {
      const loading = this.loading();
      const control = this.control();
      const serverSideSearch = this.disableClientFilter();
      untracked(() => {
        if (control.disabled || (loading && !serverSideSearch)) {
          this.searchControl.disable();
        } else {
          this.searchControl.enable();
        }
      });
    });
  }

  ngOnInit(): void {
    this.control()
      .valueChanges.pipe(this.takeUntilDestroyed())
      .subscribe((value) => {
        if (value && this.searchControl.value !== value) {
          this.searchControl.setValue(value, { emitEvent: false });
        } else if (value === undefined) {
          this.clearInput();
        }
      });

    this.control().registerOnDisabledChange((disabled: boolean) => {
      if (disabled) {
        this.searchControl.disable();
      } else {
        this.searchControl.enable();
      }
    });
    this.searchControl.setValue(this.control().value, { emitEvent: false });
    this.searchControl.setValidators(this.control().validator);
  }

  ngOnDestroy(): void {
    this.changeSubject.complete();
  }

  protected filterOptions(value: string | number | null | undefined): void {
    this.searchTerm.set(value?.toString() ?? '');
  }

  protected triggerSearch(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.searchChanged.emit(this.searchTerm());
  }

  protected optionSelected($event: MatAutocompleteSelectedEvent): void {
    this.searchTerm.set(null);
    this.changed.emit($event.option.value);
    this.selectedItem.set(this.items().find((item) => item.id == $event.option.value) ?? null);
    this.control().setValue($event.option.value);
  }

  protected displayFn = (id: string | number | undefined): string => {
    const item = id != null ? this.items().find((option) => option.id === id) : null;
    if (item) {
      return item.name ?? '';
    }
    return this.disableClientFilter() ? (this.searchTerm() ?? '') : '';
  };

  protected closeDropdown(): void {
    if (this.disableClientFilter()) {
      const term = this.searchTerm();
      if (term !== null && term !== '') return;
    }
    this.searchControl.setValue(this.control().value);
    this.searchTerm.set(null);
  }

  protected onLoadMoreClick($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.loadMore.emit();
  }

  protected clearInputAndMarkTouched(): void {
    this.clearInput();
    this.control().markAsTouched();
  }

  private clearInput(): void {
    this.searchControl.setValue(null);
    this.searchTerm.set(null);
    this.selectedItem.set(null);
    this.control().setValue(null);
    this.searchChanged.emit('');
  }

  protected openDropdown(): void {
    const term = this.searchTerm();
    if (term === null || term === '') {
      this.searchControl.setValue(undefined);
    }
    this.searchControl.markAsPristine();
    this.searchControl.markAsUntouched();
  }
}
