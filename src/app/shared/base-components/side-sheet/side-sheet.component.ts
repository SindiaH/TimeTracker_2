import { ChangeDetectionStrategy, Component, inject, input, signal, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject, Subscription } from 'rxjs';
import { ComponentBase } from '@core/base/component-base';
import { DialogConfig } from '@shared/types/dialog.type';

@Component({
  selector: 'app-side-sheet',
  standalone: false,
  templateUrl: './side-sheet.component.html',
  styleUrl: './side-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideSheetComponent extends ComponentBase {
  readonly titleText = input.required<string>();

  @ViewChild('sideSheet') private dialogContent: TemplateRef<SideSheetComponent> | undefined;

  protected readonly isOpen = signal<boolean>(false);
  protected modalRef: MatDialogRef<SideSheetComponent, boolean> | undefined;

  private readonly dialog = inject(MatDialog);
  private readonly submitted = new Subject<boolean>();
  private subscriptions: Subscription[] = [];

  open(options: DialogConfig = {}): Promise<boolean | undefined> {
    options.position = { right: '0' };
    options.height = '100vh';

    return new Promise((resolve) => {
      if (this.dialogContent === undefined) {
        resolve(false);
        return;
      }
      this.modalRef = this.dialog.open(this.dialogContent, options);
      this.subscriptions.push(
        this.modalRef.afterOpened().subscribe(() => this.isOpen.set(true)),
        this.submitted.subscribe((result) => {
          this.unsubscribeAll();
          this.isOpen.set(false);
          resolve(result);
        }),
        this.modalRef.backdropClick().subscribe(() => this.close()),
        this.modalRef.afterClosed().subscribe(() => {
          this.unsubscribeAll();
          this.isOpen.set(false);
        }),
      );
    });
  }

  close(isSubmitted: boolean = false): void {
    this.submitted.next(isSubmitted);
    if (this.modalRef?.close) {
      this.modalRef.close(isSubmitted);
    }
    this.unsubscribeAll();
  }

  private unsubscribeAll(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }
}
