import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { ServiceBase } from '@core/base/service-base';
import { FolderProvider } from '@core/providers/folder.provider';
import { TaskProvider } from '@core/providers/task.provider';
import { FolderReadModel } from '@database/read-models/folder-read-model';
import { TaskReadModel } from '@database/read-models/task-read-model';
import { TaskTreeNode } from '@modules/tasks/types/task-tree-node.type';

@Injectable()
export class TasksTreeService extends ServiceBase {
  private readonly taskProvider = inject(TaskProvider);
  private readonly folderProvider = inject(FolderProvider);

  private readonly _collapsedIds = signal<Set<string>>(new Set<string>());
  private readonly _selectedNodeId = signal<string | null>(null);

  readonly tree: Signal<TaskTreeNode[]> = computed<TaskTreeNode[]>(() =>
    this.buildTree(this.folderProvider.folderList(), this.taskProvider.taskList()),
  );

  readonly collapsedIds: Signal<Set<string>> = this._collapsedIds.asReadonly();
  readonly selectedNodeId: Signal<string | null> = this._selectedNodeId.asReadonly();

  readonly hasNodes: Signal<boolean> = computed<boolean>(
    () => this.folderProvider.folderList().length > 0 || this.taskProvider.taskList().length > 0,
  );

  readonly isLoading: Signal<boolean> = computed<boolean>(
    () => this.folderProvider.isLoading() || this.taskProvider.isLoading(),
  );

  readonly isInitialized: Signal<boolean> = computed<boolean>(
    () => this.folderProvider.isInitialized() && this.taskProvider.isInitialized(),
  );

  toggleExpanded(nodeId: string): void {
    this._collapsedIds.update((set) => {
      const next = new Set(set);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }

  expand(nodeId: string): void {
    this._collapsedIds.update((set) => {
      if (!set.has(nodeId)) return set;
      const next = new Set(set);
      next.delete(nodeId);
      return next;
    });
  }

  selectNode(nodeId: string | null): void {
    this._selectedNodeId.set(nodeId);
  }

  isExpanded(nodeId: string): boolean {
    return !this._collapsedIds().has(nodeId);
  }

  private buildTree(folders: FolderReadModel[], tasks: TaskReadModel[]): TaskTreeNode[] {
    const folderById = new Map<string, FolderReadModel>();
    for (const folder of folders) {
      if (folder.id) folderById.set(folder.id, folder);
    }
    const folderNodes = new Map<string, TaskTreeNode>();
    for (const folder of folders) {
      if (!folder.id) continue;
      folderNodes.set(folder.id, {
        id: folder.id,
        kind: 'folder',
        name: folder.name,
        color: folder.color,
        parentColor: folder.parentColor,
        parentFolderId: folder.parentFolderId,
        duration: 0,
        isArchived: folder.isArchived,
        depth: 0,
        children: [],
        source: folder,
      });
    }
    const roots: TaskTreeNode[] = [];
    for (const folderNode of folderNodes.values()) {
      const parentId = folderNode.parentFolderId;
      const parent = parentId ? folderNodes.get(parentId) : undefined;
      if (parent) {
        parent.children.push(folderNode);
      } else {
        roots.push(folderNode);
      }
    }

    for (const task of tasks) {
      if (!task.id) continue;
      const parent = task.parentFolderId ? folderNodes.get(task.parentFolderId) : undefined;
      const parentColor =
        task.parentColor ?? (task.parentFolderId ? folderById.get(task.parentFolderId)?.color : undefined);
      const taskNode: TaskTreeNode = {
        id: task.id,
        kind: 'task',
        name: task.name,
        color: task.color,
        parentColor,
        parentFolderId: task.parentFolderId,
        duration: task.duration,
        isArchived: task.isArchived,
        depth: 0,
        children: [],
        source: task,
      };
      if (parent) {
        parent.children.push(taskNode);
      } else {
        roots.push(taskNode);
      }
    }

    this.assignDepths(roots, 0);
    this.computeFolderDurations(roots);
    this.sortNodes(roots);
    return roots;
  }

  private assignDepths(nodes: TaskTreeNode[], depth: number): void {
    for (const node of nodes) {
      node.depth = depth;
      this.assignDepths(node.children, depth + 1);
    }
  }

  private computeFolderDurations(nodes: TaskTreeNode[]): number {
    let total = 0;
    for (const node of nodes) {
      if (node.kind === 'folder') {
        node.duration = this.computeFolderDurations(node.children);
      }
      total += node.duration;
    }
    return total;
  }

  private sortNodes(nodes: TaskTreeNode[]): void {
    const collator = new Intl.Collator(undefined, { sensitivity: 'base' });
    const sorter = (a: TaskTreeNode, b: TaskTreeNode): number => {
      if (a.kind !== b.kind) {
        return a.kind === 'folder' ? -1 : 1;
      }
      const orderA = (a.source.order as number | undefined) ?? Number.MAX_SAFE_INTEGER;
      const orderB = (b.source.order as number | undefined) ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return collator.compare(a.name, b.name);
    };
    nodes.sort(sorter);
    for (const node of nodes) {
      if (node.children.length > 0) {
        this.sortNodes(node.children);
      }
    }
  }
}
