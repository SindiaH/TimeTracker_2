import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type ProgressIndicatorType = 'spinner' | 'bar';
export type ProgressIndicatorMode = 'indeterminate' | 'determinate';

@Component({
  selector: 'app-progress-indicator',
  standalone: false,
  templateUrl: './progress-indicator.component.html',
  styleUrl: './progress-indicator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressIndicatorComponent {
  readonly type = input<ProgressIndicatorType>('spinner');
  readonly mode = input<ProgressIndicatorMode>('indeterminate');
  readonly value = input<number>(0);
}
