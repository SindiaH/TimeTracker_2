import { ChangeDetectionStrategy, Component, input, OnInit, output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ComponentBase } from '@core/base/component-base';

export type SearchValue = string | null | undefined;

@Component({
  selector: 'app-search',
  standalone: false,
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent extends ComponentBase implements OnInit {
  readonly placeholderText = input<string>('Suche');
  readonly control = input.required<FormControl<SearchValue>>();

  readonly changed = output<SearchValue>();
  readonly keyUpEvent = output<SearchValue>();
  readonly enterPressed = output<SearchValue>();
  readonly clearedValue = output<SearchValue>();
  readonly focusInEvent = output<void>();

  private readonly searchText$ = new Subject<SearchValue>();

  ngOnInit(): void {
    this.searchText$
      .pipe(debounceTime(600), distinctUntilChanged(), this.takeUntilDestroyed())
      .subscribe((searchPhrase) => this.keyUpEvent.emit(searchPhrase));
  }

  protected onChange(): void {
    this.changed.emit(this.control().value);
  }

  protected search(searchTerm: string): void {
    this.searchText$.next(searchTerm);
  }

  protected getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected keyPressed($event: KeyboardEvent): void {
    if ($event.key === 'Enter') {
      this.enterPressed.emit(this.control().value);
    }
  }

  protected resetValue(): void {
    this.control().setValue(undefined);
    this.clearedValue.emit(this.control().value);
  }
}
