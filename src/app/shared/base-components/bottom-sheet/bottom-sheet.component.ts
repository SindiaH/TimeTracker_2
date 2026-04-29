import { ChangeDetectionStrategy, Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-bottom-sheet',
  standalone: false,
  templateUrl: './bottom-sheet.component.html',
  styleUrl: './bottom-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomSheetComponent {
  @ViewChild('bottomSheet') private bottomSheet: TemplateRef<BottomSheetComponent> | undefined;

  private readonly bottomSheetService = inject(MatBottomSheet);
  private bottomSheetRef: MatBottomSheetRef<BottomSheetComponent> | undefined;

  open(): void {
    if (this.bottomSheet) {
      this.bottomSheetRef = this.bottomSheetService.open(this.bottomSheet);
    }
  }

  close(): void {
    this.bottomSheetRef?.dismiss();
  }
}
