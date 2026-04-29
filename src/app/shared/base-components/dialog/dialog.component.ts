import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject, Subscription } from 'rxjs';
import { ComponentBase } from '@core/base/component-base';
import { DialogConfig } from '@shared/types/dialog.type';

@Component({
  selector: 'app-dialog',
  standalone: false,
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent extends ComponentBase {
  readonly titleText = input<string | null>(null);
  readonly cancelButtonText = input<string>('Abbrechen');
  readonly submitButtonText = input<string>('Speichern');
  readonly submitDisabled = input<boolean>(false);
  readonly showPopupOnly = input<boolean>(false);
  readonly hideHeader = input<boolean>(false);
  readonly hideFooter = input<boolean>(false);
  readonly showMiniCloseButton = input<boolean>(false);
  readonly useCustomCloseAction = input<boolean>(false);
  readonly hidePredefinedActions = input<boolean>(false);

  readonly closeButtonAction = output<void>();

  @ViewChild('dialog') private dialogContent: TemplateRef<DialogComponent> | undefined;

  protected readonly isOpen = signal<boolean>(false);
  protected modalRef: MatDialogRef<DialogComponent, boolean> | undefined;

  private readonly dialog = inject(MatDialog);
  private readonly submitted = new Subject<boolean>();
  private subscriptions: Subscription[] = [];
  private options: DialogConfig | undefined;

  open(options: DialogConfig = {}): Promise<boolean | undefined> {
    if (options.type === 'fullScreen') {
      options.height = 'calc(100% - 12px)';
      options.width = 'calc(100% - 12px)';
      options.maxWidth = '100%';
      options.maxHeight = '100%';
    }
    options.panelClass = this.combineClass(options.panelClass, 'app-dialog-container');
    if (options.animation === 'from-bottom' || options.animation === 'from-right') {
      options.panelClass = this.combineClass(options.panelClass, `animation-${options.animation}`);
      options.panelClass = this.combineClass(
        options.panelClass,
        'animation-duration-' + (options.animationDuration ?? '500'),
      );
    } else {
      options.animation = 'default';
    }

    this.options = options;
    return new Promise((resolve) => {
      if (this.dialogContent === undefined) {
        resolve(false);
        return;
      }
      this.modalRef = this.dialog.open(this.dialogContent, options);
      this.subscriptions.push(
        this.modalRef.afterOpened().subscribe(() => this.isOpen.set(true)),
        this.modalRef.backdropClick().subscribe(() => {
          this.close();
          resolve(false);
        }),
        this.modalRef.afterClosed().subscribe(() => {
          this.unsubscribeAll();
          this.isOpen.set(false);
        }),
        this.submitted.subscribe((result) => {
          this.unsubscribeAll();
          this.isOpen.set(false);
          resolve(result);
        }),
      );
    });
  }

  protected submit(): void {
    this.close(true);
  }

  close(isSubmitted: boolean = false): void {
    if (this.useCustomCloseAction()) {
      this.closeButtonAction.emit();
      return;
    }
    let timeoutDuration = 0;
    if (this.modalRef?.addPanelClass && this.options?.animation !== 'default') {
      switch (this.options?.animation) {
        case 'from-bottom':
          this.modalRef.addPanelClass('animation-to-bottom');
          break;
        case 'from-right':
          this.modalRef.addPanelClass('animation-to-right');
          break;
      }
      timeoutDuration = this.options?.animationDuration ? +this.options.animationDuration : 500;
    }

    setTimeout(() => {
      this.submitted.next(isSubmitted);
      if (this.modalRef?.close) {
        this.modalRef.close(isSubmitted);
      }
      this.unsubscribeAll();
    }, timeoutDuration);
  }

  private unsubscribeAll(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  private combineClass(panelClass: string | string[] | undefined, classToAdd: string): string | string[] {
    if (!panelClass) return classToAdd;
    if (Array.isArray(panelClass)) {
      panelClass.push(classToAdd);
      return panelClass;
    }
    return [panelClass, classToAdd];
  }
}
