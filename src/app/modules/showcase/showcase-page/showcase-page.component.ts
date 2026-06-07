import { ChangeDetectionStrategy, Component, signal, Signal, WritableSignal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { ComponentBase } from '@core/base/component-base';

type SearchModel = {
  query: string;
};

@Component({
  selector: 'app-showcase-page',
  standalone: false,
  templateUrl: './showcase-page.component.html',
  styleUrl: './showcase-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowcasePageComponent extends ComponentBase {
  protected readonly searchModel = signal<SearchModel>({ query: '' });
  protected readonly searchForm = form(this.searchModel);

  private readonly _searchTerm: WritableSignal<string | null> = signal<string | null>(null);
  protected readonly searchTerm: Signal<string | null> = this._searchTerm.asReadonly();

  protected onSearchChanged(value: string): void {
    this._searchTerm.set(value === '' ? null : value);
  }
}
