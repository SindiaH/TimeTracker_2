# Data Model Design

- **Status:** proposed
- **Date:** 2026-04-28
- **Participants:** Aki

## Context

The application manages several entity types: tasks, folders, time entries, activities, idle periods, holidays, hostnames, rules, rule sets, and user options. A clean, consistent data model is needed that supports hierarchical task/folder organization, time tracking with a running-timer concept, desktop activity recording, automation rules, and per-user data isolation via Row-Level Security.

The backend uses Supabase/PostgREST, which auto-generates REST endpoints from the PostgreSQL schema. PostgREST supports nested selects (resource embedding) that resolve foreign-key relationships in a single API call — e.g., `.from('time_entries').select('*, task:tasks(name, color)')`. However, PostgREST does not support cross-table aggregations (COUNT, SUM) via nested selects — these require either multiple API calls with frontend computation, or a database view.

The data model is carried over from the previous TimeTracker project and must be preserved as-is.

## Decision

The following entity model is adopted for TimeTracker_2:

### Base Entity

```typescript
class BaseEntity {
  id?: string;          // UUID, primary key
  userid?: string;      // FK to auth.users
  createdAt: Date;      // ISO timestamp
  updatedAt?: Date;     // ISO timestamp
}
```

All concrete entities extend `BaseEntity` as a class (not interface). The field `userid` is lowercase (no camelCase) to match the existing database schema.

### Core Entities

#### TaskEntity
```typescript
class TaskEntity extends BaseEntity {
  name: string;
  description?: string;
  parentFolderId?: string;  // FK to folders
  color?: string;           // Hex color code
  order?: number;           // Display order within parent folder
  isArchived: boolean;      // Soft delete
}
```
Tasks reference a `FolderEntity` via `parentFolderId`. Tasks and folders are separate entities — tasks represent trackable work items, folders provide hierarchical grouping.

#### FolderEntity
```typescript
class FolderEntity extends BaseEntity {
  name: string;
  parentFolderId?: string;  // Self-referencing FK for folder hierarchy
  color?: string;           // Hex color code
  order?: number;           // Display order within parent
  isArchived: boolean;      // Soft delete
}
```
Folders use a self-referencing `parentFolderId` for hierarchical nesting. Tasks belong to folders via `TaskEntity.parentFolderId`.

#### TimeEntryEntity
```typescript
class TimeEntryEntity extends BaseEntity {
  taskId: string;            // FK to tasks
  notes?: string;
  from: Date | string;       // Start timestamp
  to?: Date | string;        // End timestamp — null/undefined = currently running
}
```
`to` being absent indicates a currently running timer, eliminating the need for a separate "running entry" concept. The `from`/`to` fields accept both `Date` and `string` types to accommodate different serialization formats from the backend.

#### ActivityInfoEntity
```typescript
class ActivityInfoEntity extends BaseEntity {
  hostname: string;          // Machine identifier
  title: string;             // Window title
  processId: number;         // OS process ID
  url: string;               // URL (for browsers)
  name: string;              // Application name
  path: string;              // Application path
  startDate: Date;           // Tracking start
  endDate?: Date;            // Tracking end
}
```

#### IdleInfoEntity
```typescript
class IdleInfoEntity extends BaseEntity {
  hostname: string;
  idleStartDate: Date;
  idleEndDate?: Date;
}
```

#### HolidaysEntity
```typescript
class HolidaysEntity extends BaseEntity {
  from: string;              // Start date (ISO date string)
  to: string;                // End date (ISO date string)
}
```
Holidays represent date ranges rather than individual days.

#### OptionsEntity
```typescript
class OptionsEntity {
  userid?: string;
  holidayOptions?: string;   // JSON-serialized holiday settings
}
```
`OptionsEntity` does **not** extend `BaseEntity` — it is a standalone entity with only `userid` and `holidayOptions`.

#### HostnameEntity
```typescript
class HostnameEntity extends BaseEntity {
  name: string;              // Hostname
  alias?: string;            // User-defined display name
}
```

#### RuleEntity
```typescript
class RuleEntity extends BaseEntity {
  ruleSetId?: string;        // FK to rule_sets
  searchValue?: string;      // Value to match against
  searchType?: SearchTypeEnum;
  fieldType?: FieldTypeEnum;
  isActive?: boolean;
}
```

#### RuleSetEntity
```typescript
class RuleSetEntity extends BaseEntity {
  taskId: string;            // FK to tasks — target task for automation
  startTimerType: StartTimerType;
  pauseTimerType: PauseTimerType;
  startTimerTime: number;    // Delay in seconds
  pauseTimerTime: number;    // Delay in seconds
  isActive: boolean;
}
```
Rule sets define automation behavior: when a matching rule fires, the timer for the linked task is started or paused according to the configured type and delay.

### Enums

```typescript
enum SearchTypeEnum {
  contains,
  startsWith,
}

enum FieldTypeEnum {
  name,
  title,
  url,
}

enum StartTimerType {
  startTimer,
  notifyMe,
}

enum PauseTimerType {
  pauseTimer,
  notifyMe,
  dontPause,
}
```

### Read Models (Database Views)

Read models extend their base entities with computed/aggregated fields. Each is backed by a database view.

#### TimeEntryReadModel (View: `timeentries_extended`)
```typescript
class TimeEntryReadModel extends TimeEntryEntity {
  parentIds: string[];     // Computed: folder hierarchy (not mapped from DB)
  taskName: string;
  folderName: string;
  duration: number;        // Computed from from/to
  parentColor?: string;    // Inherited from parent folder
  isSelected: boolean;     // UI state (not mapped from DB)
}
```

#### TaskReadModel (View: `tasks_extended`)
```typescript
class TaskReadModel extends TaskEntity {
  childCount: number;      // COUNT of child time entries
  parentName: string;      // Parent folder name
  fullParentName: string;  // Full folder path
  parentColor?: string;    // Inherited from parent folder
  duration: number;        // SUM of time entry durations
}
```

#### FolderReadModel (View: `folders_extended`)
```typescript
class FolderReadModel extends FolderEntity {
  childCount: number;      // COUNT of child tasks/folders
  duration: number;        // SUM of time entry durations across child tasks
  parentColor?: string;    // Inherited from parent folder
}
```

#### Database Views SQL

```sql
-- View: timeentries_extended
CREATE OR REPLACE VIEW timeentries_extended AS
SELECT
  te.*,
  t.name AS task_name,
  f.name AS folder_name,
  f.color AS parent_color,
  COALESCE(
    EXTRACT(EPOCH FROM (te."to" - te."from")),
    0
  ) AS duration
FROM time_entries te
LEFT JOIN tasks t ON te.task_id = t.id
LEFT JOIN folders f ON t.parent_folder_id = f.id;

-- View: tasks_extended
CREATE OR REPLACE VIEW tasks_extended AS
SELECT
  t.*,
  (SELECT COUNT(*)
   FROM time_entries te
   WHERE te.task_id = t.id) AS child_count,
  f.name AS parent_name,
  f.color AS parent_color,
  COALESCE(
    (SELECT SUM(EXTRACT(EPOCH FROM (te."to" - te."from")))
     FROM time_entries te
     WHERE te.task_id = t.id AND te."to" IS NOT NULL),
    0
  ) AS duration
FROM tasks t
LEFT JOIN folders f ON t.parent_folder_id = f.id;

-- View: folders_extended
CREATE OR REPLACE VIEW folders_extended AS
SELECT
  f.*,
  (SELECT COUNT(*)
   FROM tasks t
   WHERE t.parent_folder_id = f.id) AS child_count,
  pf.color AS parent_color,
  COALESCE(
    (SELECT SUM(EXTRACT(EPOCH FROM (te."to" - te."from")))
     FROM time_entries te
     JOIN tasks t ON te.task_id = t.id
     WHERE t.parent_folder_id = f.id AND te."to" IS NOT NULL),
    0
  ) AS duration
FROM folders f
LEFT JOIN folders pf ON f.parent_folder_id = pf.id;
```

RLS on the underlying tables is automatically enforced for views. Duration values contain only direct entries; recursive summation over subfolders is performed in the frontend from the flat view data.

### Database Design Principles

1. **Row-Level Security**: All tables have RLS policies filtered by `userid = auth.uid()`
2. **UUID primary keys**: `gen_random_uuid()` in PostgreSQL
3. **Timestamps**: `created_at` and `updated_at` with `DEFAULT now()` and triggers
4. **Soft delete**: Tasks and folders use `isArchived`, hard delete for other entities
5. **Single base class**: Common fields (`id`, `userid`, `createdAt`, `updatedAt`) are defined once in `BaseEntity` and inherited by all concrete entities (except `OptionsEntity`)
6. **Views for read models**: Database views provide pre-computed aggregations (counts, durations, parent names) to avoid extra API calls and excessive data transfer
7. **Separate Task and Folder entities**: Tasks represent trackable work items with time entries; folders provide hierarchical grouping. This separation allows folders to organize tasks without conflating the two concepts

## Consequences

- Separate Task and Folder entities provide clear domain separation — folders organize, tasks track work
- `to: null` for running timers is a standard pattern that simplifies queries
- Three database views (`timeentries_extended`, `tasks_extended`, `folders_extended`) provide pre-computed read models, avoiding extra API calls for aggregations; these views must be maintained when the underlying table schema changes
- RLS policies ensure data isolation at the database level
- Rule/RuleSet entities enable automation (auto-start/pause timers based on active window)
- `OptionsEntity` standing alone (without `BaseEntity`) reflects that user options are a simple key-value store, not a tracked entity
- JSON-serialized `holidayOptions` provides flexibility but loses query-ability for individual settings

## Alternatives Considered

- **Self-referencing single entity**: Merging tasks and folders into one entity type with a self-referencing `parentId`. Rejected because tasks and folders serve different purposes — tasks have time entries and descriptions, folders provide grouping. Keeping them separate avoids ambiguity and simplifies queries (e.g., listing only folders for navigation, only tasks for time entry assignment).
- **Database views for all read models**: Views for every read model including simple FK lookups. Rejected for simple joins because PostgREST nested selects provide the same result without adding views to the schema. Adopted selectively for aggregation read models where the alternative — transferring all time entries to the frontend — causes unnecessary data transfer and additional API calls.
- **No database views at all**: All read models computed entirely in the frontend. Rejected because the read models require aggregating data across multiple tables (counts, duration sums), resulting in unnecessary data transfer. PostgREST nested selects do not support cross-table aggregations.
- **Normalized settings tables**: Separate tables for each settings category. Rejected because settings rarely need to be queried independently — a JSON column is sufficient and more flexible.
