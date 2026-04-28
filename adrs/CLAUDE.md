# TimeTracker_2 ADR Repository

This repository contains Architecture Decision Records (ADRs) for the TimeTracker_2 project. ADRs document architecture decisions across four categories: Frontend, Backend Integration, Electron, Database.

## File Structure

- `README.md` — Overview page with links to all ADRs, grouped by category
- `template.md` — Mandatory template for new ADRs
- `<category>/ADR-NXXXX-short-title.md` — Individual ADRs in category subdirectories

### Category Directories

| Category             | Directory                |
|----------------------|--------------------------|
| Frontend             | `1-frontend/`            |
| Backend Integration  | `2-backend-integration/` |
| Electron             | `3-electron/`            |
| Database             | `4-database/`            |

## ADR Conventions

### File Naming

`ADR-NXXXX-short-title.md` — category-prefixed, sequentially numbered, kebab-case.

The first digit encodes the category, followed by a 4-digit sequence number:

| Category             | Prefix | Example                                               |
|----------------------|--------|-------------------------------------------------------|
| Frontend             | 1xxxx  | `ADR-10001-angular-v21-as-frontend-framework.md`      |
| Backend Integration  | 2xxxx  | `ADR-20001-backend-abstraction-layer.md`               |
| Electron             | 3xxxx  | `ADR-30001-electron-as-desktop-runtime.md`             |
| Database             | 4xxxx  | `ADR-40001-data-model-design.md`                       |

### Categories

Each ADR belongs to exactly one category (determined by its number prefix):
- Frontend (1xxxx)
- Backend Integration (2xxxx)
- Electron (3xxxx)
- Database (4xxxx)

### Structure

Each ADR **MUST** follow the structure from `template.md` exactly — no deviations in sections, order, or metadata fields:

1. **Title** as H1 (`# Short Decision Title`)
2. **Metadata**: Status, Date, Participants (in exactly this order)
3. **Context** — Situation, problem, constraints
4. **Decision** — What was decided and why
5. **Consequences** — Implications of the decision
6. **Alternatives Considered** (optional) — Rejected alternatives

Valid status values: `proposed`, `accepted`, `deprecated`, `superseded by ADR-NXXXX`

## Rules

1. **Follow template**: Every ADR MUST follow the structure from `template.md` exactly.
2. **README linking**: Every new ADR MUST be linked in `README.md` under the appropriate category. Format:
   ```
   - [ADR-NXXXX: Title](./<category-dir>/ADR-NXXXX-short-title.md) - Status
   ```
3. **Language**: English.
4. **Next number**: Before creating a new ADR, find the highest existing number within the relevant category prefix range and use the next one.
