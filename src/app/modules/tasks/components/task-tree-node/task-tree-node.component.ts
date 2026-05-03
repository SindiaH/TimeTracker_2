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
import { APP_ICONS } from '@core/constants/app-icons';
import { TRANSLATION_KEYS } from '@core/constants/translation-keys';
import { TasksTreeService } from '@modules/tasks/services/tasks-tree.service';
import { TaskTreeNode } from '@modules/tasks/types/task-tree-node.type';

export type TaskTreeAction =
  | { type: 'select'; node: TaskTreeNode }
  | { type: 'toggle'; node: TaskTreeNode }
  | { type: 'add-folder-here'; node: TaskTreeNode }
  | { type: 'add-task-here'; node: TaskTreeNode }
  | { type: 'edit'; node: TaskTreeNode }
  | { type: 'archive'; node: TaskTreeNode }
  | { type: 'unarchive'; node: TaskTreeNode }
  | { type: 'delete'; node: TaskTreeNode };

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

  readonly node: InputSignal<TaskTreeNode> = input.required<TaskTreeNode>();
  readonly action: OutputEmitterRef<TaskTreeAction> = output<TaskTreeAction>();

  protected readonly icons = APP_ICONS;
  protected readonly translationKeys = TRANSLATION_KEYS.tasks;

  protected readonly isFolder: Signal<boolean> = computed<boolean>(() => this.node().kind === 'folder');
  protected readonly hasChildren: Signal<boolean> = computed<boolean>(() => this.node().children.length > 0);
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
}
