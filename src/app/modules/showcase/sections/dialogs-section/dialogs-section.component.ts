import { ChangeDetectionStrategy, Component, input, InputSignal, viewChild } from '@angular/core';
import { TRANSLATION_KEYS } from '@core/constants/translation-keys';
import { BottomSheetComponent } from '@shared/base-components/bottom-sheet/bottom-sheet.component';
import { DialogComponent } from '@shared/base-components/dialog/dialog.component';
import { SideSheetComponent } from '@shared/base-components/side-sheet/side-sheet.component';

@Component({
  selector: 'app-dialogs-section',
  standalone: false,
  templateUrl: './dialogs-section.component.html',
  styleUrl: './dialogs-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogsSectionComponent {
  readonly searchTerm: InputSignal<string | null> = input.required<string | null>();

  protected readonly translationKeys = TRANSLATION_KEYS;
  protected readonly keywords: ReadonlyArray<string> = [
    TRANSLATION_KEYS.showcase.sections.dialogs,
    'dialog',
    'modal',
    'sheet',
    'side',
    'bottom',
    'popup',
    'app-dialog',
    'app-bottom-sheet',
    'app-side-sheet',
  ];

  protected readonly basicDialog = viewChild<DialogComponent>('basicDialog');
  protected readonly fullScreenDialog = viewChild<DialogComponent>('fullScreenDialog');
  protected readonly bottomSheet = viewChild<BottomSheetComponent>('bottomSheet');
  protected readonly sideSheet = viewChild<SideSheetComponent>('sideSheet');

  protected openBasic(): void {
    this.basicDialog()?.open({ width: '420px' });
  }

  protected openFullScreen(): void {
    this.fullScreenDialog()?.open({ type: 'fullScreen' });
  }

  protected openBottom(): void {
    this.bottomSheet()?.open();
  }

  protected openSide(): void {
    this.sideSheet()?.open();
  }
}
