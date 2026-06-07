import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
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
import { form } from '@angular/forms/signals';
import { ComponentBase } from '@core/base/component-base';
import { TranslationKey } from '@core/constants/translation-keys';
import { TranslationService } from '@core/i18n/translation.service';
import { FolderProvider } from '@core/providers/folder.provider';
import { TaskProvider } from '@core/providers/task.provider';
import { UpdateFolderCommand } from '@database/entities/folder.entity';
import { UpdateTaskCommand } from '@database/entities/task.entity';
import { ButtonToggleOption } from '@shared/base-components/button-toggle/button-toggle.type';
import { ButtonToggleValue } from '@shared/base-components/button-toggle/button-toggle.component';
import { DialogComponent } from '@shared/base-components/dialog/dialog.component';
import { TaskFormComponent } from '@modules/tasks/components/task-form/task-form.component';
import { TaskTreeAction } from '@modules/tasks/components/task-tree-node/task-tree-node.component';
import { TasksTreeService } from '@modules/tasks/services/tasks-tree.service';
import { TreeDropPriorityService } from '@modules/tasks/services/tree-drop-priority.service';
import { TaskTreeNode, TaskTreeNodeKind } from '@modules/tasks/types/task-tree-node.type';

const FILTER_ALL = 'all';
const FILTER_ARCHIVE = 'archive';

type FilterValue = typeof FILTER_ALL | typeof FILTER_ARCHIVE;

type FilterFormModel = {
  filter: ButtonToggleValue;
};

@Component({
  selector: 'app-tasks-overview',
  standalone: false,
  templateUrl: './tasks-overview.component.html',
  styleUrl: './tasks-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksOverviewComponent extends ComponentBase {
  private readonly taskProvider = inject(TaskProvider);
  private readonly folderProvider = inject(FolderProvider);
  private readonly translationService = inject(TranslationService);
  protected readonly tasksTreeService = inject(TasksTreeService);
  private readonly dropPriority = inject(TreeDropPriorityService);

  protected readonly filterModel = signal<FilterFormModel>({ filter: FILTER_ALL });
  protected readonly filterForm = form(this.filterModel);

  protected readonly filterOptions: Signal<ButtonToggleOption[]> = computed<ButtonToggleOption[]>(() => [
    {
      id: FILTER_ALL,
      name: this.translationService.instant(this.translationKeys.tasks.filter.all),
    },
    {
      id: FILTER_ARCHIVE,
      name: this.translationService.instant(this.translationKeys.tasks.filter.archive),
    },
  ]);

  protected readonly tree: Signal<TaskTreeNode[]> = this.tasksTreeService.tree;
  protected readonly rootFolders: Signal<TaskTreeNode[]> = computed<TaskTreeNode[]>(() =>
    this.tree().filter((node) => node.kind === 'folder'),
  );
  protected readonly rootTasks: Signal<TaskTreeNode[]> = computed<TaskTreeNode[]>(() =>
    this.tree().filter((node) => node.kind === 'task'),
  );
  protected readonly hasNodes: Signal<boolean> = this.tasksTreeService.hasNodes;
  protected readonly isLoading: Signal<boolean> = this.tasksTreeService.isLoading;
  protected readonly isInitialized: Signal<boolean> = this.tasksTreeService.isInitialized;
  protected readonly selectedNodeId: Signal<string | null> = this.tasksTreeService.selectedNodeId;
  protected readonly selectedNode: Signal<TaskTreeNode | null> = this.tasksTreeService.selectedNode;

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
    if (node === null) return this.translationKeys.tasks.delete.taskTitle;
    return node.kind === 'folder'
      ? this.translationKeys.tasks.delete.folderTitle
      : this.translationKeys.tasks.delete.taskTitle;
  });

  protected readonly deleteMessageKey: Signal<TranslationKey> = computed<TranslationKey>(() => {
    const node = this._pendingDelete();
    if (node === null) return this.translationKeys.tasks.delete.taskMessage;
    return node.kind === 'folder'
      ? this.translationKeys.tasks.delete.folderMessage
      : this.translationKeys.tasks.delete.taskMessage;
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
      case 'drop':
        void this.handleDrop(event.dragged, event.targetParentFolderId, event.targetIndex);
        return;
    }
  }

  protected onRootDrop(event: CdkDragDrop<TaskTreeNode[]>): void {
    const dragged = event.item.data as TaskTreeNode | undefined;
    if (!dragged) return;
    void this.handleDrop(dragged, null, event.currentIndex);
  }

  protected readonly canDropAtRoot = (kind: TaskTreeNodeKind) => {
    return (drag: CdkDrag<TaskTreeNode>, drop: CdkDropList): boolean => {
      if (drag.data?.kind !== kind) return false;
      return !this.dropPriority.hasInnerDropListUnderCursor(drop.element.nativeElement);
    };
  };

  protected readonly canDropFolderRoot = this.canDropAtRoot('folder');
  protected readonly canDropTaskRoot = this.canDropAtRoot('task');

  protected async confirmDelete(): Promise<void> {
    const node = this._pendingDelete();
    if (node === null || this.isDeleting()) return;
    const succeeded =
      node.kind === 'folder'
        ? await this.folderProvider.removeFolder(node.id)
        : await this.taskProvider.removeTask(node.id);
    if (!succeeded) return;
    if (this.selectedNodeId() === node.id) {
      this.tasksTreeService.selectNode(null);
    }
    this.deleteDialog()?.close(true);
    this._pendingDelete.set(null);
  }

  protected cancelDelete(): void {
    if (this.isDeleting()) return;
    this.deleteDialog()?.close(false);
    this._pendingDelete.set(null);
  }

  private async applyFilter(filter: FilterValue): Promise<void> {
    const archivedOnly = filter === FILTER_ARCHIVE;
    await Promise.all([this.taskProvider.setFilter({ archivedOnly }), this.folderProvider.setFilter({ archivedOnly })]);
  }

  private async archive(node: TaskTreeNode, archive: boolean): Promise<void> {
    if (this.isUpdating()) return;
    if (node.kind === 'folder') {
      await this.folderProvider.archiveFolder(node.id, archive);
    } else {
      await this.taskProvider.archiveTask(node.id, archive);
    }
  }

  private requestDelete(node: TaskTreeNode): void {
    this._pendingDelete.set(node);
    void this.deleteDialog()?.open({ width: '420px' });
  }

  private async handleDrop(
    dragged: TaskTreeNode,
    targetParentFolderId: string | null,
    targetIndex: number,
  ): Promise<void> {
    if (targetParentFolderId !== null && dragged.id === targetParentFolderId) return;
    if (dragged.kind === 'folder' && targetParentFolderId !== null) {
      if (this.tasksTreeService.isDescendantOrSelf(dragged.id, targetParentFolderId)) return;
    }

    const sourceParentFolderId = dragged.parentFolderId ?? null;
    const isCrossParent = sourceParentFolderId !== targetParentFolderId;
    const targetSiblings = this.findSiblings(dragged.kind, targetParentFolderId);
    const newSiblings = [...targetSiblings];

    if (isCrossParent) {
      const insertIdx = targetIndex < 0 ? newSiblings.length : Math.max(0, Math.min(targetIndex, newSiblings.length));
      newSiblings.splice(insertIdx, 0, dragged);
    } else {
      const fromIdx = newSiblings.findIndex((node) => node.id === dragged.id);
      if (fromIdx < 0) return;
      const insertIdx =
        targetIndex < 0 ? newSiblings.length - 1 : Math.max(0, Math.min(targetIndex, newSiblings.length - 1));
      if (fromIdx === insertIdx) return;
      const [moved] = newSiblings.splice(fromIdx, 1);
      if (!moved) return;
      newSiblings.splice(insertIdx, 0, moved);
    }

    const updates: Promise<unknown>[] = this.collectUpdates(
      dragged.kind,
      newSiblings,
      dragged.id,
      isCrossParent,
      targetParentFolderId,
    );

    if (isCrossParent) {
      const oldSiblings = this.findSiblings(dragged.kind, sourceParentFolderId).filter(
        (node) => node.id !== dragged.id,
      );
      for (let i = 0; i < oldSiblings.length; i++) {
        const node = oldSiblings[i];
        if (!node) continue;
        if (node.source.order === i) continue;
        if (dragged.kind === 'folder') {
          updates.push(this.folderProvider.updateFolder({ id: node.id, order: i }));
        } else {
          updates.push(this.taskProvider.updateTask({ id: node.id, order: i }));
        }
      }
    }

    if (updates.length === 0) return;

    if (targetParentFolderId !== null) {
      this.tasksTreeService.expand(targetParentFolderId);
    }

    await Promise.all(updates);
  }

  private collectUpdates(
    kind: TaskTreeNodeKind,
    newSiblings: TaskTreeNode[],
    draggedId: string,
    isCrossParent: boolean,
    targetParentFolderId: string | null,
  ): Promise<unknown>[] {
    const updates: Promise<unknown>[] = [];
    for (let i = 0; i < newSiblings.length; i++) {
      const node = newSiblings[i];
      if (!node) continue;
      const isDraggedNode = node.id === draggedId;
      const orderChanged = node.source.order !== i;
      const parentChanged = isDraggedNode && isCrossParent;
      if (!orderChanged && !parentChanged) continue;
      if (kind === 'folder') {
        const command: UpdateFolderCommand = { id: node.id };
        if (orderChanged) command.order = i;
        if (parentChanged) command.parentFolderId = targetParentFolderId;
        updates.push(this.folderProvider.updateFolder(command));
      } else {
        const command: UpdateTaskCommand = { id: node.id };
        if (orderChanged) command.order = i;
        if (parentChanged) command.parentFolderId = targetParentFolderId;
        updates.push(this.taskProvider.updateTask(command));
      }
    }
    return updates;
  }

  private findSiblings(kind: TaskTreeNodeKind, parentFolderId: string | null): TaskTreeNode[] {
    if (parentFolderId === null) {
      return this.tree().filter((node) => node.kind === kind);
    }
    const parent = this.tasksTreeService.getNodeById(parentFolderId);
    if (parent === null) return [];
    return parent.children.filter((node) => node.kind === kind);
  }
}
