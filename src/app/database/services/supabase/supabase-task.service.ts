import { inject, Injectable } from '@angular/core';
import { ServiceBase } from '@core/base/service-base';
import { AddTaskCommand, TaskEntity, UpdateTaskCommand } from '@database/entities/task.entity';
import { ITaskService, TaskListFilter } from '@database/services/interfaces/task-service.interface';
import { SupabaseDataClient } from '@database/services/supabase/supabase-data-client';
import { SupabaseUtil } from '@database/services/supabase/supabase-util';
import { TaskReadModel } from '@database/read-models/task-read-model';

const TASKS_TABLE = 'tasks';
const TASKS_VIEW = 'tasks_extended';

@Injectable({ providedIn: 'root' })
export class SupabaseTaskService extends ServiceBase implements ITaskService {
  private readonly client = inject(SupabaseDataClient).client;

  async list(filter: TaskListFilter): Promise<TaskReadModel[]> {
    const { data, error } = await this.client.from(TASKS_VIEW).select('*').eq('isArchived', filter.archivedOnly);
    if (error) {
      throw SupabaseUtil.mapError(error);
    }
    return (data ?? []).map((row) => this.mapTaskReadModel(row));
  }

  async getById(id: string): Promise<TaskReadModel | null> {
    const { data, error } = await this.client.from(TASKS_VIEW).select('*').eq('id', id).maybeSingle();
    if (error) {
      throw SupabaseUtil.mapError(error);
    }
    return data === null ? null : this.mapTaskReadModel(data);
  }

  async add(command: AddTaskCommand): Promise<TaskEntity> {
    const payload = {
      name: command.name,
      description: command.description ?? null,
      parentFolderId: command.parentFolderId ?? null,
      color: command.color ?? null,
      order: command.order ?? null,
      isArchived: false,
    };
    const { data, error } = await this.client.from(TASKS_TABLE).insert(payload).select('*').single();
    if (error) {
      throw SupabaseUtil.mapError(error);
    }
    return this.mapTask(data);
  }

  async update(command: UpdateTaskCommand): Promise<TaskEntity> {
    const patch: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (command.name !== undefined) patch['name'] = command.name;
    if (command.description !== undefined) patch['description'] = command.description;
    if (command.parentFolderId !== undefined) patch['parentFolderId'] = command.parentFolderId;
    if (command.color !== undefined) patch['color'] = command.color;
    if (command.order !== undefined) patch['order'] = command.order;
    if (command.isArchived !== undefined) patch['isArchived'] = command.isArchived;

    const { data, error } = await this.client.from(TASKS_TABLE).update(patch).eq('id', command.id).select('*').single();
    if (error) {
      throw SupabaseUtil.mapError(error);
    }
    return this.mapTask(data);
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.client.from(TASKS_TABLE).delete().eq('id', id);
    if (error) {
      throw SupabaseUtil.mapError(error);
    }
  }

  private mapTask(row: Record<string, unknown>): TaskEntity {
    const entity = new TaskEntity();
    entity.id = row['id'] as string | undefined;
    entity.userid = row['userid'] as string | undefined;
    entity.createdAt = SupabaseUtil.parseDate(row['createdAt']);
    entity.updatedAt = SupabaseUtil.parseDate(row['updatedAt']);
    entity.name = (row['name'] as string | null) ?? '';
    entity.description = (row['description'] as string | null) ?? undefined;
    entity.parentFolderId = (row['parentFolderId'] as string | null) ?? undefined;
    entity.color = (row['color'] as string | null) ?? undefined;
    entity.order = (row['order'] as number | null) ?? undefined;
    entity.isArchived = (row['isArchived'] as boolean | null) ?? false;
    return entity;
  }

  private mapTaskReadModel(row: Record<string, unknown>): TaskReadModel {
    const model = new TaskReadModel();
    Object.assign(model, this.mapTask(row));
    model.childCount = (row['childCount'] as number | null) ?? 0;
    model.parentName = (row['parentName'] as string | null) ?? undefined;
    model.fullParentName = (row['fullParentName'] as string | null) ?? undefined;
    model.parentColor = (row['parentColor'] as string | null) ?? undefined;
    model.duration = (row['duration'] as number | null) ?? 0;
    return model;
  }
}
