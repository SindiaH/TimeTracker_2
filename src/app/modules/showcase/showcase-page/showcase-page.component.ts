import { ChangeDetectionStrategy, Component, signal, Signal, WritableSignal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ComponentBase } from '@core/base/component-base';
import { SearchValue } from '@shared/base-components/search/search.component';

@Component({
  selector: 'app-showcase-page',
  standalone: false,
  templateUrl: './showcase-page.component.html',
  styleUrl: './showcase-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowcasePageComponent extends ComponentBase {
  protected readonly searchControl: FormControl<SearchValue> = new FormControl<SearchValue>(null);
  private readonly _searchTerm: WritableSignal<string | null> = signal<string | null>(null);
  protected readonly searchTerm: Signal<string | null> = this._searchTerm.asReadonly();

  protected onSearchChanged(value: SearchValue): void {
    this._searchTerm.set(value ?? null);
  }
}
