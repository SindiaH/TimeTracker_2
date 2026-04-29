import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

export type PaginatorNavigationEvent = {
  pageIndex: number;
  pageSize: number;
};

@Component({
  selector: 'app-paginator',
  standalone: false,
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorComponent {
  readonly disabled = input<boolean>(false);
  readonly pageSize = input<number>(25);
  readonly pageSizeOptions = input<number[]>([5, 10, 25, 100]);
  readonly fullLength = input<number | undefined>(undefined);
  readonly pageIndex = input<number>(0);

  readonly navigationChanged = output<PaginatorNavigationEvent>();

  protected handlePageEvent($event: PageEvent): void {
    this.navigationChanged.emit({ pageIndex: $event.pageIndex, pageSize: $event.pageSize });
  }
}
