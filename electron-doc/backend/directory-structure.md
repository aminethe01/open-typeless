# Directory Structure

> Domain-driven directory layout for Electron main process.

---

## Main Process Structure

```
src/main/
├── index.ts              # Main process entry
├── db/                   # Database layer
│   ├── client.ts         # Drizzle client initialization
│   ├── schema.ts         # All table schemas
│   └── migrate.ts        # Migration logic
├── ipc/                  # IPC handlers (thin layer)
│   ├── index.ts          # Register all handlers
│   ├── project.handler.ts
│   └── user.handler.ts
└── services/             # Business logic (domain-driven)
    ├── {domain}/         # One folder per domain
    │   ├── types.ts      # Zod schemas + TypeScript types (REQUIRED)
    │   ├── procedures/   # Endpoint handlers (REQUIRED)
    │   │   ├── create.ts
    │   │   ├── list.ts
    │   │   ├── get.ts
    │   │   ├── update.ts
    │   │   └── delete.ts
    │   └── lib/          # Shared business logic (OPTIONAL)
    │       ├── helpers.ts
    │       └── cache.ts
    ├── project/          # Example: Project domain
    │   ├── types.ts
    │   ├── procedures/
    │   │   ├── create.ts
    │   │   ├── list.ts
    │   │   ├── get.ts
    │   │   ├── update.ts
    │   │   └── delete.ts
    │   └── lib/
    │       └── cache.ts
    ├── user/             # Example: User domain
    │   ├── types.ts
    │   ├── procedures/
    │   │   ├── get.ts
    │   │   └── update.ts
    │   └── lib/
    │       └── helpers.ts
    └── logger.ts         # Shared logger (not a domain)
```

---

## Domain Examples

| Domain     | Description        | Example Procedures                          |
| ---------- | ------------------ | ------------------------------------------- |
| `project`  | Project management | `create`, `list`, `get`, `update`, `delete` |
| `user`     | User management    | `get`, `update`, `updateSettings`           |
| `auth`     | Authentication     | `login`, `logout`, `checkSession`           |
| `settings` | App settings       | `get`, `save`, `reset`                      |
| `file`     | File operations    | `read`, `write`, `list`, `delete`           |

---

## Shared Types Directory

```
src/shared/
├── constants/
│   ├── channels.ts       # IPC channel names
│   └── config.ts         # App configuration
└── types/
    ├── common.ts         # Shared utilities (e.g., createOutputSchema)
    ├── project.ts        # Project-related types
    └── user.ts           # User-related types
```

---

## Test Directory Structure

```
tests/
├── setup/
│   ├── global-setup.ts        # Test database initialization
│   └── test-helpers.ts        # Test utilities
├── factories/                 # Test data factories
│   ├── index.ts               # Barrel export + resetAllCounters()
│   ├── user.factory.ts
│   └── project.factory.ts
├── mocks/
│   └── electron.ts            # Electron API mocks
├── unit/                      # Mock-based unit tests
│   └── services/{domain}/
│       ├── lib/*.test.ts      # Utility function tests
│       └── procedures/*.test.ts
└── integration/               # Real database tests
    └── database/*.test.ts
```

---

## Test File Naming Convention

| Type             | Location                        | Naming                |
| ---------------- | ------------------------------- | --------------------- |
| Unit test        | `tests/unit/services/{domain}/` | `{file}.test.ts`      |
| Integration test | `tests/integration/{category}/` | `{feature}.test.ts`   |
| Factory          | `tests/factories/`              | `{entity}.factory.ts` |

---

## Key Principles

1. **One folder per domain** - Each business domain has its own folder
2. **types.ts is required** - Every domain must have Zod schemas and types
3. **procedures/ is required** - One file per action (create, get, list, etc.)
4. **lib/ is optional** - Only add when you have reusable logic
5. **IPC handlers are thin** - They only call procedures, no business logic

---

## IPC Handler Example

```typescript
// src/main/ipc/project.handler.ts
import { ipcMain } from "electron";
import { createProject } from "../services/project/procedures/create";
import { listProjects } from "../services/project/procedures/list";
import { IPC_CHANNELS } from "../../shared/constants/channels";

export function setupProjectHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.PROJECT.CREATE, (_, input) =>
    createProject(input),
  );
  ipcMain.handle(IPC_CHANNELS.PROJECT.LIST, (_, input) => listProjects(input));
}
```

---

## When to Create a New Domain

Create a new domain folder when:

- You have a new business concept (e.g., "tasks", "notes", "settings")
- You need multiple CRUD operations on an entity
- The logic is distinct from existing domains

Do NOT create a new domain for:

- Single utility functions (put in existing domain's `lib/`)
- Cross-cutting concerns (put in `services/` root, e.g., `logger.ts`)
