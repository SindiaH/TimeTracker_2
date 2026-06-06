import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
} from '@angular/core';
import { ComponentBase } from '@core/base/component-base';
import { TasksTreeService } from '@modules/tasks/services/tasks-tree.service';
import { TreeDropPriorityService } from '@modules/tasks/services/tree-drop-priority.service';
import { TaskTreeNode, TaskTreeNodeKind } from '@modules/tasks/types/task-tree-node.type';

export type TaskTreeNodeAction = {
  type: 'select' | 'toggle' | 'add-folder-here' | 'add-task-here' | 'edit' | 'archive' | 'unarchive' | 'delete';
  node: TaskTreeNode;
};

export type TaskTreeDropAction = {
  type: 'drop';
  dragged: TaskTreeNode;
  targetParentFolderId: string | null;
  targetIndex: number;
};

export type TaskTreeAction = TaskTreeNodeAction | TaskTreeDropAction;

const DEFAULT_FOLDER_COLOR = '#9aa0a6';
const DEFAULT_TASK_COLOR = '#5b9bd5';

@Component({
  selector: 'app-task-tree-node',
  standalone: false,
  templateUrl: './task-tree-node.component.html',
  styleUrl: './task-tree-node.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskTreeNodeComponent extends ComponentBase {
  private readonly tasksTreeService = inject(TasksTreeService);
  private readonly dropPriority = inject(TreeDropPriorityService);

  readonly node: InputSignal<TaskTreeNode> = input.required<TaskTreeNode>();
  readonly action: OutputEmitterRef<TaskTreeAction> = output<TaskTreeAction>();

  protected readonly isFolder: Signal<boolean> = computed<boolean>(() => this.node().kind === 'folder');
  protected readonly hasChildren: Signal<boolean> = computed<boolean>(() => this.node().children.length > 0);
  protected readonly folderChildren: Signal<TaskTreeNode[]> = computed<TaskTreeNode[]>(() =>
    this.node().children.filter((child) => child.kind === 'folder'),
  );
  protected readonly taskChildren: Signal<TaskTreeNode[]> = computed<TaskTreeNode[]>(() =>
    this.node().children.filter((child) => child.kind === 'task'),
  );
  protected readonly isExpanded: Signal<boolean> = computed<boolean>(() =>
    this.tasksTreeService.isExpanded(this.node().id),
  );
  protected readonly isSelected: Signal<boolean> = computed<boolean>(
    () => this.tasksTreeService.selectedNodeId() === this.node().id,
  );
  protected readonly nodeColor: Signal<string> = computed<string>(() => {
    const node = this.node();
    return node.color || node.parentColor || (node.kind === 'folder' ? DEFAULT_FOLDER_COLOR : DEFAULT_TASK_COLOR);
  });

  protected onToggle(): void {
    this.action.emit({ type: 'toggle', node: this.node() });
  }

  protected onSelect(): void {
    this.action.emit({ type: 'select', node: this.node() });
  }

  protected onAddFolderHere(): void {
    this.action.emit({ type: 'add-folder-here', node: this.node() });
  }

  protected onAddTaskHere(): void {
    this.action.emit({ type: 'add-task-here', node: this.node() });
  }

  protected onEdit(): void {
    this.action.emit({ type: 'edit', node: this.node() });
  }

  protected onArchive(): void {
    this.action.emit({ type: 'archive', node: this.node() });
  }

  protected onUnarchive(): void {
    this.action.emit({ type: 'unarchive', node: this.node() });
  }

  protected onDelete(): void {
    this.action.emit({ type: 'delete', node: this.node() });
  }

  protected onChildAction(action: TaskTreeAction): void {
    this.action.emit(action);
  }

  protected onChildDrop(event: CdkDragDrop<TaskTreeNode[]>): void {
    this.emitDrop(event, this.node().id, event.currentIndex);
  }

  protected onDropIntoFolder(event: CdkDragDrop<TaskTreeNode[]>): void {
    this.emitDrop(event, this.node().id, -1);
  }

  protected readonly canDropIntoFolder = (drag: CdkDrag<TaskTreeNode>): boolean => {
    const dragged = drag.data;
    if (!dragged) return false;
    const target = this.node();
    if (target.kind !== 'folder') return false;
    if (dragged.id === target.id) return false;
    if (dragged.kind === 'folder' && this.tasksTreeService.isDescendantOrSelf(dragged.id, target.id)) return false;
    return true;
  };

  protected readonly canDropChildOfKind = (kind: TaskTreeNodeKind) => {
    return (drag: CdkDrag<TaskTreeNode>, drop: CdkDropList): boolean => {
      const dragged = drag.data;
      if (!dragged || dragged.kind !== kind) return false;
      if (kind === 'folder' && this.tasksTreeService.isDescendantOrSelf(dragged.id, this.node().id)) return false;
      return !this.dropPriority.hasInnerDropListUnderCursor(drop.element.nativeElement);
    };
  };

  protected readonly canDropFolderChild = this.canDropChildOfKind('folder');
  protected readonly canDropTaskChild = this.canDropChildOfKind('task');

  private emitDrop(event: CdkDragDrop<TaskTreeNode[]>, targetParentFolderId: string | null, targetIndex: number): void {
    const dragged = event.item.data as TaskTreeNode | undefined;
    if (!dragged) return;
    this.action.emit({
      type: 'drop',
      dragged,
      targetParentFolderId,
      targetIndex,
    });
  }
}
