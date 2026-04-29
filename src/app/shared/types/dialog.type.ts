import { MatDialogConfig } from '@angular/material/dialog';

export type DialogAnimationType = 'default' | 'from-bottom' | 'from-right';

export class DialogConfig extends MatDialogConfig {
  type?: 'basic' | 'fullScreen' = 'basic';
  animation?: DialogAnimationType = 'default';
  animationDuration?: '300' | '500' | '1000' = '500';
}
