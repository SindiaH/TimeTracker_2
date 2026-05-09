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
import { FormControl } from '@angular/forms';
import { ComponentBase } from '@core/base/component-base';
import { APP_ICONS } from '@core/constants/app-icons';
import { TRANSLATION_KEYS, TranslationKey } from '@core/constants/translation-keys';
import { TranslationService } from '@core/i18n/translation.service';
import { FolderProvider } from '@core/providers/folder.provider';
import { TaskProvider } from '@core/providers/task.provider';
import { ButtonToggleOption } from '@shared/base-components/button-toggle/button-toggle.type';
import { ButtonToggleValue } from '@shared/base-components/button-toggle/button-toggle.component';
import { DialogComponent } from '@shared/base-components/dialog/dialog.component';
import { TaskFormComponent } from '@modules/tasks/components/task-form/task-form.component';
import { TaskTreeAction } from '@modules/tasks/components/task-tree-node/task-tree-node.component';
import { TasksTreeService } from '@modules/tasks/services/tasks-tree.service';
import { TaskTreeNode } from '@modules/tasks/types/task-tree-node.type';

const FILTER_ALL = 'all';
const FILTER_ARCHIVE = 'archive';

type FilterValue = typeof FILTER_ALL | typeof FILTER_ARCHIVE;

type FeedbackKind = 'error' | 'info';

type Feedback = {
  kind: FeedbackKind;
  message: string;
};

@Component({
  selector: 'app-tasks-overview',
  standalone: false,
  templateUrl: './tasks-overview.component.html',
  styleUrl: './tasks-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TasksTreeService],
})
export class TasksOverviewComponent extends ComponentBase {
  private readonly taskProvider = inject(TaskProvider);
  private readonly folderProvider = inject(FolderProvider);
  private readonly translationService = inject(TranslationService);
  protected readonly tasksTreeService = inject(TasksTreeService);

  protected readonly icons = APP_ICONS;
  protected readonly translationKeys = TRANSLATION_KEYS.tasks;

  protected readonly filterControl: FormControl<ButtonToggleValue> = new FormControl<ButtonToggleValue>(FILTER_ALL, {
    nonNullable: true,
  });

  protected readonly filterOptions: Signal<ButtonToggleOption[]> = computed<ButtonToggleOption[]>(() => [
    {
      id: FILTER_ALL,
      name: this.translationService.instant(this.translationKeys.filter.all),
    },
    {
      id: FILTER_ARCHIVE,
      name: this.translationService.instant(this.translationKeys.filter.archive),
    },
  ]);

  protected readonly tree: Signal<TaskTreeNode[]> = this.tasksTreeService.tree;
  protected readonly hasNodes: Signal<boolean> = this.tasksTreeService.hasNodes;
  protected readonly isLoading: Signal<boolean> = this.tasksTreeService.isLoading;
  protected readonly isInitialized: Signal<boolean> = this.tasksTreeService.isInitialized;
  protected readonly selectedNodeId: Signal<string | null> = this.tasksTreeService.selectedNodeId;
  protected readonly selectedNode: Signal<TaskTreeNode | null> = computed<TaskTreeNode | null>(() => {
    const id = this.selectedNodeId();
    if (id === null) return null;
    return this.findNode(this.tree(), id);
  });

  private readonly _feedback: WritableSignal<Feedback | null> = signal<Feedback | null>(null);
  protected readonly feedback: Signal<Feedback | null> = this._feedback.asReadonly();

  private readonly _pendingDelete: WritableSignal<TaskTreeNode | null> = signal<TaskTreeNode | null>(null);
  protected readonly pendingDelete: Signal<TaskTreeNode | null> = this._pendingDelete.asReadonly();
  protected readonly isUpdating: Signal<boolean> = computed<boolean>(
    () => this.taskProvider.isUpdating() || this.folderProvider.isUpdating(),
  );
  protected readonly isDeleting: Signal<boolean> = computed<boolean>(
    () => this.taskProvider.isDeleting() || this.folderProvider.isDeleting(),
  );

  protected readonly deleteTitleKey: Signal<TranslationKey> = computed<TranslationKey>(() => {
    const node = this._pendingDelete();
    if (node === null) return this.translationKeys.delete.taskTitle;
    return node.kind === 'folder' ? this.translationKeys.delete.folderTitle : this.translationKeys.delete.taskTitle;
  });

  protected readonly deleteMessageKey: Signal<TranslationKey> = computed<TranslationKey>(() => {
    const node = this._pendingDelete();
    if (node === null) return this.translationKeys.delete.taskMessage;
    return node.kind === 'folder' ? this.translationKeys.delete.folderMessage : this.translationKeys.delete.taskMessage;
  });

  private readonly taskForm = viewChild<TaskFormComponent>('taskForm');
  private readonly deleteDialog = viewChild<DialogComponent>('deleteDialog');

  protected onFilterChanged(value: ButtonToggleValue): void {
    void this.applyFilter(value === FILTER_ARCHIVE ? 'archive' : 'all');
  }

  protected onAddFolder(): void {
    this.taskForm()?.openForCreateFolder(null);
  }

  protected onAddTask(): void {
    this.taskForm()?.openForCreateTask(null);
  }

  protected onTreeAction(event: TaskTreeAction): void {
    switch (event.type) {
      case 'select':
        this.tasksTreeService.selectNode(event.node.id);
        return;
      case 'toggle':
        this.tasksTreeService.toggleExpanded(event.node.id);
        return;
      case 'add-folder-here':
        this.taskForm()?.openForCreateFolder(event.node.id);
        return;
      case 'add-task-here':
        this.taskForm()?.openForCreateTask(event.node.id);
        return;
      case 'edit':
        if (event.node.kind === 'folder') {
          this.taskForm()?.openForEditFolder(event.node.source);
        } else {
          this.taskForm()?.openForEditTask(event.node.source);
        }
        return;
      case 'archive':
        void this.archive(event.node, true);
        return;
      case 'unarchive':
        void this.archive(event.node, false);
        return;
      case 'delete':
        this.requestDelete(event.node);
        return;
    }
  }

  protected async confirmDelete(): Promise<void> {
    const node = this._pendingDelete();
    if (node === null || this.isDeleting()) return;
    this._feedback.set(null);
    try {
      if (node.kind === 'folder') {
        await this.folderProvider.removeFolder(node.id);
      } else {
        await this.taskProvider.removeTask(node.id);
      }
      if (this.selectedNodeId() === node.id) {
        this.tasksTreeService.selectNode(null);
      }
      this.deleteDialog()?.close(true);
      this._pendingDelete.set(null);
    } catch {
      this._feedback.set({
        kind: 'error',
        message: this.translationService.instant(this.translationKeys.feedback.deleteFailed),
      });
    }
  }

  protected cancelDelete(): void {
    if (this.isDeleting()) return;
    this.deleteDialog()?.close(false);
    this._pendingDelete.set(null);
  }

  private async applyFilter(filter: FilterValue): Promise<void> {
    const archivedOnly = filter === FILTER_ARCHIVE;
    this._feedback.set(null);
    try {
      await Promise.all([
        this.taskProvider.setFilter({ archivedOnly }),
        this.folderProvider.setFilter({ archivedOnly }),
      ]);
    } catch {
      this._feedback.set({
        kind: 'error',
        message: this.translationService.instant(this.translationKeys.feedback.loadFailed),
      });
    }
  }

  private async archive(node: TaskTreeNode, archive: boolean): Promise<void> {
    if (this.isUpdating()) return;
    this._feedback.set(null);
    try {
      if (node.kind === 'folder') {
        await this.folderProvider.archiveFolder(node.id, archive);
      } else {
        await this.taskProvider.archiveTask(node.id, archive);
      }
    } catch {
      this._feedback.set({
        kind: 'error',
        message: this.translationService.instant(this.translationKeys.feedback.saveFailed),
      });
    }
  }

  private requestDelete(node: TaskTreeNode): void {
    this._pendingDelete.set(node);
    void this.deleteDialog()?.open({ width: '420px' });
  }

  private findNode(nodes: TaskTreeNode[], id: string): TaskTreeNode | null {
    for (const node of nodes) {
      if (node.id === id) return node;
      const childMatch = this.findNode(node.children, id);
      if (childMatch) return childMatch;
    }
    return null;
  }
}
