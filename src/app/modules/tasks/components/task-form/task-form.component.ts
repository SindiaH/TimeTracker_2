import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Signal,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ComponentBase } from '@core/base/component-base';
import { TRANSLATION_KEYS, TranslationKey } from '@core/constants/translation-keys';
import { TranslationService } from '@core/i18n/translation.service';
import { FolderProvider } from '@core/providers/folder.provider';
import { TaskProvider } from '@core/providers/task.provider';
import { FolderReadModel } from '@database/read-models/folder-read-model';
import { TaskReadModel } from '@database/read-models/task-read-model';
import { DialogComponent } from '@shared/base-components/dialog/dialog.component';

const NAME_MAX_LENGTH = 80;
const DESCRIPTION_MAX_LENGTH = 500;

type TaskFormMode = 'create-folder' | 'create-task' | 'edit-folder' | 'edit-task';

type TaskFormGroup = {
  name: FormControl<string>;
  description: FormControl<string>;
  color: FormControl<string>;
};

@Component({
  selector: 'app-task-form',
  standalone: false,
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFormComponent extends ComponentBase {
  private readonly taskProvider = inject(TaskProvider);
  private readonly folderProvider = inject(FolderProvider);
  private readonly translationService = inject(TranslationService);

  protected readonly translationKeys = TRANSLATION_KEYS.tasks;

  protected readonly nameControl: FormControl<string> = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(NAME_MAX_LENGTH)],
  });
  protected readonly descriptionControl: FormControl<string> = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.maxLength(DESCRIPTION_MAX_LENGTH)],
  });
  protected readonly colorControl: FormControl<string> = new FormControl<string>('', {
    nonNullable: true,
  });
  protected readonly form: FormGroup<TaskFormGroup> = new FormGroup<TaskFormGroup>({
    name: this.nameControl,
    description: this.descriptionControl,
    color: this.colorControl,
  });

  private readonly _mode: WritableSignal<TaskFormMode | null> = signal<TaskFormMode | null>(null);
  private readonly _editingId: WritableSignal<string | null> = signal<string | null>(null);
  private readonly _parentFolderId: WritableSignal<string | null> = signal<string | null>(null);

  private readonly nameControlEvents = toSignal(this.nameControl.events);

  protected readonly mode: Signal<TaskFormMode | null> = this._mode.asReadonly();
  protected readonly isSubmitting: Signal<boolean> = computed<boolean>(
    () =>
      this.taskProvider.isAdding() ||
      this.taskProvider.isUpdating() ||
      this.folderProvider.isAdding() ||
      this.folderProvider.isUpdating(),
  );

  protected readonly titleKey: Signal<TranslationKey> = computed<TranslationKey>(() => {
    switch (this._mode()) {
      case 'create-folder':
        return this.translationKeys.form.createFolderTitle;
      case 'create-task':
        return this.translationKeys.form.createTaskTitle;
      case 'edit-folder':
        return this.translationKeys.form.editFolderTitle;
      case 'edit-task':
        return this.translationKeys.form.editTaskTitle;
      default:
        return this.translationKeys.form.createTaskTitle;
    }
  });

  protected readonly showDescription: Signal<boolean> = computed<boolean>(() => {
    const mode = this._mode();
    return mode === 'create-task' || mode === 'edit-task';
  });

  protected readonly nameError: Signal<string | null> = computed<string | null>(() => {
    this.nameControlEvents();
    const errors = this.nameControl.errors;
    if (errors === null || !this.nameControl.touched) {
      return null;
    }
    if (errors['required']) {
      return this.translationService.instant(this.translationKeys.errors.nameRequired);
    }
    if (errors['maxlength']) {
      return this.translationService.instant(this.translationKeys.errors.nameMaxLength, {
        count: NAME_MAX_LENGTH,
      });
    }
    return null;
  });

  private readonly dialog = viewChild<DialogComponent>('dialog');

  openForCreateFolder(parentFolderId: string | null = null): void {
    this.resetState();
    this._mode.set('create-folder');
    this._parentFolderId.set(parentFolderId);
    this.colorControl.setValue(this.resolveTopMostParentColor(parentFolderId));
    this.openDialog();
  }

  openForCreateTask(parentFolderId: string | null = null): void {
    this.resetState();
    this._mode.set('create-task');
    this._parentFolderId.set(parentFolderId);
    this.colorControl.setValue(this.resolveTopMostParentColor(parentFolderId));
    this.openDialog();
  }

  openForEditFolder(folder: FolderReadModel): void {
    this.resetState();
    this._mode.set('edit-folder');
    this._editingId.set(folder.id ?? null);
    this._parentFolderId.set(folder.parentFolderId ?? null);
    this.nameControl.setValue(folder.name);
    this.colorControl.setValue(folder.color ?? this.resolveTopMostParentColor(folder.parentFolderId));
    this.openDialog();
  }

  openForEditTask(task: TaskReadModel): void {
    this.resetState();
    this._mode.set('edit-task');
    this._editingId.set(task.id ?? null);
    this._parentFolderId.set(task.parentFolderId ?? null);
    this.nameControl.setValue(task.name);
    this.descriptionControl.setValue(task.description ?? '');
    this.colorControl.setValue(task.color ?? this.resolveTopMostParentColor(task.parentFolderId));
    this.openDialog();
  }

  protected async onSubmit(): Promise<void> {
    if (this.isSubmitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const succeeded = await this.persist();
    if (succeeded) {
      this.dialog()?.close(true);
    }
  }

  protected onCancel(): void {
    if (this.isSubmitting()) return;
    this.dialog()?.close(false);
  }

  private async persist(): Promise<boolean> {
    const mode = this._mode();
    const name = this.nameControl.value.trim();
    const description = this.descriptionControl.value.trim();
    const color = this.colorControl.value.trim();
    const parentFolderId = this._parentFolderId();
    const editingId = this._editingId();
    switch (mode) {
      case 'create-folder':
        return (
          (await this.folderProvider.addFolder({
            name,
            parentFolderId: parentFolderId ?? undefined,
            color: color === '' ? undefined : color,
          })) !== null
        );
      case 'create-task':
        return (
          (await this.taskProvider.addTask({
            name,
            parentFolderId: parentFolderId ?? undefined,
            description: description === '' ? undefined : description,
            color: color === '' ? undefined : color,
          })) !== null
        );
      case 'edit-folder':
        if (editingId === null) return false;
        return (
          (await this.folderProvider.updateFolder({
            id: editingId,
            name,
            color: color === '' ? null : color,
          })) !== null
        );
      case 'edit-task':
        if (editingId === null) return false;
        return (
          (await this.taskProvider.updateTask({
            id: editingId,
            name,
            description: description === '' ? null : description,
            color: color === '' ? null : color,
          })) !== null
        );
      default:
        return false;
    }
  }

  private openDialog(): void {
    void this.dialog()?.open({ width: '420px' });
  }

  private resetState(): void {
    this._editingId.set(null);
    this._parentFolderId.set(null);
    this.nameControl.reset('');
    this.descriptionControl.reset('');
    this.colorControl.reset('');
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  private resolveTopMostParentColor(parentFolderId: string | null | undefined): string {
    if (!parentFolderId) return '';
    const folders = this.folderProvider.folderList();
    const byId = new Map(folders.filter((folder) => folder.id).map((folder) => [folder.id as string, folder]));
    let current = byId.get(parentFolderId);
    const visited = new Set<string>();
    while (current?.parentFolderId && !visited.has(current.parentFolderId)) {
      visited.add(current.parentFolderId);
      const parent = byId.get(current.parentFolderId);
      if (!parent) break;
      current = parent;
    }
    return current?.color ?? '';
  }
}
