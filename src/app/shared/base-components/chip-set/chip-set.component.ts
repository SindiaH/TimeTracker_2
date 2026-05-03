import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-chip-set',
  standalone: false,
  templateUrl: './chip-set.component.html',
  styleUrl: './chip-set.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipSetComponent {}
