import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-load-more',
  standalone: false,
  templateUrl: './load-more.component.html',
  styleUrl: './load-more.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadMoreComponent {
  readonly count = input.required<number>();
  readonly totalCount = input.required<number>();
  readonly loading = input<boolean>(false);
  readonly disableLoadMore = input<boolean>(false);
  readonly buttonTitle = input.required<string>();
  readonly counterLabel = input<string | null>(null);

  readonly loadNextPage = output<void>();

  readonly isLastPageReached = computed<boolean>(() => {
    return this.count() >= this.totalCount();
  });
}
