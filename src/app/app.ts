import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentBase } from '@core/base/component-base';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App extends ComponentBase {}
