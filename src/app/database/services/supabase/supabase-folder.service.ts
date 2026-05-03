import { inject, Injectable } from '@angular/core';
import { ServiceBase } from '@core/base/service-base';
import { AddFolderCommand, FolderEntity, UpdateFolderCommand } from '@database/entities/folder.entity';
import { FolderListFilter, IFolderService } from '@database/services/interfaces/folder-service.interface';
import { SupabaseDataClient } from '@database/services/supabase/supabase-data-client';
import { SupabaseUtil } from '@database/services/supabase/supabase-util';
import { FolderReadModel } from '@database/read-models/folder-read-model';

const FOLDERS_TABLE = 'folders';
const FOLDERS_VIEW = 'folders_extended';

@Injectable({ providedIn: 'root' })
export class SupabaseFolderService extends ServiceBase implements IFolderService {
  private readonly client = inject(SupabaseDataClient).client;

  async list(filter: FolderListFilter): Promise<FolderReadModel[]> {
    const { data, error } = await this.client.from(FOLDERS_VIEW).select('*').eq('isArchived', filter.archivedOnly);
    if (error) {
      throw SupabaseUtil.mapError(error);
    }
    return (data ?? []).map((row) => this.mapFolderReadModel(row));
  }

  async getById(id: string): Promise<FolderReadModel | null> {
    const { data, error } = await this.client.from(FOLDERS_VIEW).select('*').eq('id', id).maybeSingle();
    if (error) {
      throw SupabaseUtil.mapError(error);
    }
    return data === null ? null : this.mapFolderReadModel(data);
  }

  async add(command: AddFolderCommand): Promise<FolderEntity> {
    const payload = {
      name: command.name,
      parentFolderId: command.parentFolderId ?? null,
      color: command.color ?? null,
      order: command.order ?? null,
      isArchived: false,
    };
    const { data, error } = await this.client.from(FOLDERS_TABLE).insert(payload).select('*').single();
    if (error) {
      throw SupabaseUtil.mapError(error);
    }
    return this.mapFolder(data);
  }

  async update(command: UpdateFolderCommand): Promise<FolderEntity> {
    const patch: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (command.name !== undefined) patch['name'] = command.name;
    if (command.parentFolderId !== undefined) patch['parentFolderId'] = command.parentFolderId;
    if (command.color !== undefined) patch['color'] = command.color;
    if (command.order !== undefined) patch['order'] = command.order;
    if (command.isArchived !== undefined) patch['isArchived'] = command.isArchived;

    const { data, error } = await this.client
      .from(FOLDERS_TABLE)
      .update(patch)
      .eq('id', command.id)
      .select('*')
      .single();
    if (error) {
      throw SupabaseUtil.mapError(error);
    }
    return this.mapFolder(data);
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.client.from(FOLDERS_TABLE).delete().eq('id', id);
    if (error) {
      throw SupabaseUtil.mapError(error);
    }
  }

  private mapFolder(row: Record<string, unknown>): FolderEntity {
    const entity = new FolderEntity();
    entity.id = row['id'] as string | undefined;
    entity.userid = row['userid'] as string | undefined;
    entity.createdAt = SupabaseUtil.parseDate(row['createdAt']);
    entity.updatedAt = SupabaseUtil.parseDate(row['updatedAt']);
    entity.name = (row['name'] as string | null) ?? '';
    entity.parentFolderId = (row['parentFolderId'] as string | null) ?? undefined;
    entity.color = (row['color'] as string | null) ?? undefined;
    entity.order = (row['order'] as number | null) ?? undefined;
    entity.isArchived = (row['isArchived'] as boolean | null) ?? false;
    return entity;
  }

  private mapFolderReadModel(row: Record<string, unknown>): FolderReadModel {
    const model = new FolderReadModel();
    Object.assign(model, this.mapFolder(row));
    model.childCount = (row['childCount'] as number | null) ?? 0;
    model.duration = (row['duration'] as number | null) ?? 0;
    model.parentColor = (row['parentColor'] as string | null) ?? undefined;
    return model;
  }
}
