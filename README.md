# Pyramid, a Task Management System

Full-stack task manager built to the provided Figma design for the AbleSpace
Full Stack Developer technical assessment.

- **Live app:** _<add Vercel URL>_
- **API health:** _<add Render URL>_`/api/health`
- **Figma:** [Assessment Task](https://www.figma.com/design/obONCFmoTFN27V5H9PHS2X/Assessment-Task?node-id=0-1)

---

## Stack

| Layer    | Choice                                        |
| -------- | --------------------------------------------- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling  | Tailwind CSS v4 (CSS-first config)            |
| Backend  | NestJS 11, TypeScript                         |
| Database | PostgreSQL via Prisma 7                       |
| State    | TanStack Query                                |
| UI       | Radix primitives, dnd-kit, lucide-react       |

No third-party API keys are required. The only two secrets are a Postgres
connection string and a JWT signing secret you generate yourself.

---

## What is implemented

Every frame in the Figma export is built:

| Figma screen                        | Where                        |
| ----------------------------------- | ---------------------------- |
| 1, Login                            | `/login`                     |
| 2, Board                            | `/tasks` (board mode)        |
| 3 and 7, Fields popover             | toolbar on any task view     |
| 4, List                             | `/tasks` (list mode)         |
| 5, Search                           | toolbar, Cmd+F or Ctrl+F     |
| 6 and 8, Task detail + date picker  | `/tasks/[id]`                |
| 9 and 10, Account, Theme, Color     | sidebar workspace switcher   |
| 11, Filter menu                     | toolbar on any task view     |
| 12, Project task list               | `/projects/[id]`             |
| 13, Settings                        | `/settings`                  |

Beyond the static frames: guest login with JWT sessions, drag-and-drop board
reordering with optimistic updates, inline creation of tasks, subtasks and
projects, editable task properties, threaded comments, an activity feed,
persisted theme and accent, per-screen persisted view preferences, confirmation
prompts before destructive actions, toast feedback on every failed request, and
skeleton loaders shaped like the layout they replace.

---

## Design fidelity

Colours and sizing were sampled from the PNG exports rather than estimated. A
small PNG decoder read the raw pixels, then a frequency pass over each frame
surfaced the palette and per-element measurements. The design turns out to sit
on Tailwind's `neutral` scale.

| Token              | Sampled   | Role                          |
| ------------------ | --------- | ----------------------------- |
| `--canvas`         | `#f5f5f5` | App background, board columns |
| `--sidebar`        | `#fafafa` | Sidebar                       |
| `--surface`        | `#ffffff` | Cards, tables, popovers       |
| `--surface-subtle` | `#f5f5f5` | Table headers, hover          |
| `--border-subtle`  | `#f1f1f1` | Table row dividers            |
| `--primary`        | `#171717` | Primary buttons, body text    |
| priority high      | `#f15b5b` | High and Urgent               |
| priority medium    | `#fa8433` | Medium                        |
| priority low       | `#b4bac3` | Low and No priority           |

Accent swatches are exact Tailwind 600s: amber `#d97706`, "blue" `#9333ea`,
pink `#db2777`, rose `#e11d48`, emerald `#059669`, black `#171717`.

Geometry was measured the same way. The export is roughly 0.69x the design
frame, derived by cross-checking several known-height elements, which puts
toolbar buttons at 32px with an 8px radius, login buttons at 36px with 14px,
the sidebar at 250px, board columns at 280px, and table rows at 44px.

### Theme support

Two independent axes, exactly as the design's two menus define them:

- **Change Theme:** Light or Dark
- **Color Mode:** Amber, Blue, Pink, Rose, Emerald, Black

Both persist to `localStorage` and are applied to `<html>` by a small inline
script that runs before first paint, so a reload never flashes the wrong theme.
React reads the same values through `useSyncExternalStore`, which also means
changing the theme in one tab updates every other open tab.

---

## Documented deviations

The brief asks for intentional deviations to be called out. These fall into two
groups: inconsistencies within the Figma file, and things the Figma does not
cover.

### Inconsistencies in the source design

1. **The swatch labelled "Blue" is purple.** Sampling it gives `#9333ea`,
   Tailwind's purple-600, not a blue. Reproduced exactly as designed rather
   than silently corrected, since matching the design is the requirement.
2. **The Figma ticks "Blue" but renders the UI in black.** Every frame draws
   black buttons and controls while the Color Mode menu shows Blue selected.
   Colour Mode therefore defaults to Black, so a first load reproduces the
   screens. Picking any other mode recolours accents.
3. **The Fields popover lists "Members" twice** (screens 3 and 7). Rendered
   once.
4. **Fields toggles contradict what the frames render.** Screen 3 shows Labels
   off, yet board cards draw label chips, and the list view has no Labels
   column at all. Field visibility is therefore stored per view mode, with each
   mode's defaults matching its own frame. A single shared map cannot reproduce
   both screens.
5. **The comment section is headed "Subtasks"** on screen 6, the same heading
   as the subtask table directly above it. Rendered as "Comments".
6. **The projects primary button is labelled inconsistently:** "Add Project" on
   screen 9, "Add Task" on screens 10 and 11. Uses "Add Project", which is what
   it does.
7. **Screen 6's Details rail shows status "Backlog"**, which is not one of the
   board's columns (To Do, Doing, Completed, On Hold). The rail shows the task's
   actual status.

### Not covered by the design

8. **No dark-theme frames exist.** All 13 exports are light. The dark palette
   is derived: same token roles and contrast relationships, inverted through
   the neutral scale. Happy to match real dark frames if they become available.
9. **No tablet or mobile frames exist.** Responsive behaviour is my own. The
   sidebar becomes an off-canvas drawer below `md`, the board scrolls
   horizontally, below `sm` the list view stacks the board's `TaskCard` rather
   than scrolling a five-column table sideways, and the task detail rail stacks
   under the content below `lg`.
10. **No loading, empty or error states are designed.** Built from the same
    tokens, deliberately plain.
11. **No "new task" modal appears anywhere**, so creation is inline: click
    `+ Add Task`, type, press Enter.
12. **No confirmation or toast patterns are designed.** Deleting a task is
    irreversible and mutations can fail, so both were added rather than letting
    a click silently destroy data or a request fail unnoticed.
13. **Google login is rendered but disabled.** Only Guest Login is in scope,
    and real OAuth needs credentials plus a consent screen. It carries a
    tooltip explaining why, since a button that looks live but does nothing
    would be worse.
14. **Due-date filter boundaries use the server's local midnight.** A
    production build would take the caller's timezone as a parameter.

---

## Architecture

```
apps/
  api/                    NestJS
    prisma/schema.prisma  data model
    src/
      auth/               guest login, JWT strategy, guard
      tasks/              CRUD, filtering, transactional reordering
      projects/           project CRUD
      comments/           threaded comments
      resources/          task links
      workspaces/         bootstrap payload, statuses, profile
      health/             liveness probe
  web/                    Next.js
    src/
      app/                routes; the (app) group is auth-guarded
      components/ui/      design-system primitives
      components/tasks/   board, list, detail, toolbar, filters
      components/shell/   sidebar, workspace menu, breadcrumbs
      hooks/              queries, view preferences
      lib/                api client, tokens, theme, dates, toasts
```

Decisions worth explaining:

- **Statuses are rows, not an enum.** The board has an add-column affordance,
  so columns must be data the user can extend at runtime.
- **Subtasks are tasks** with a `parentId` self-relation. Screen 6 renders them
  with the same columns as top-level tasks, so they carry the same shape.
- **Every query is scoped through `status.workspaceId`.** Each guest gets their
  own workspace, so two visitors to the public demo can never read or mutate
  each other's board.
- **Reordering runs in a transaction.** `move()` renumbers siblings and updates
  the moved task atomically, so a failure cannot leave two cards on one
  position.
- **`TaskWorkspace` is shared** by `/tasks` and `/projects/[id]`, which are the
  same screen at different scopes, so both routes are a three-line page.
- **The calendar is hand-rolled.** The design only needs single-date selection,
  which drops a dependency and keeps the markup exact.
- **Persisted state is read through `useSyncExternalStore`.** Reading
  `localStorage` in an effect would cost a second render on every mount and
  give up free cross-tab sync.
- **Toasts and confirmations are module-level stores**, not context, so
  non-React code can reach them. That is what lets one `MutationCache` handler
  surface every failed request without each call site repeating error handling.

---

## API

All routes are prefixed `/api`. Everything except `/health` and `/auth/guest`
requires `Authorization: Bearer <token>`.

| Method   | Path                      | Purpose                           |
| -------- | ------------------------- | --------------------------------- |
| `GET`    | `/health`                 | Liveness and database check       |
| `POST`   | `/auth/guest`             | Create a guest and seeded workspace |
| `GET`    | `/auth/me`                | Current session                   |
| `GET`    | `/workspace/bootstrap`    | Statuses, labels, teams, members  |
| `POST`   | `/workspace/statuses`     | Add a board column                |
| `PATCH`  | `/workspace/statuses/:id` | Rename, recolour or reorder       |
| `DELETE` | `/workspace/statuses/:id` | Remove an empty column            |
| `PATCH`  | `/workspace/profile`      | Update own profile                |
| `GET`    | `/tasks`                  | List, with search and filters     |
| `GET`    | `/tasks/:id`              | Detail with subtasks and comments |
| `POST`   | `/tasks`                  | Create a task or subtask          |
| `PATCH`  | `/tasks/:id`              | Update fields and relations       |
| `PATCH`  | `/tasks/:id/move`         | Board drag-and-drop               |
| `DELETE` | `/tasks/:id`              | Delete                            |
| `GET`    | `/projects`               | List projects                     |
| `GET`    | `/projects/:id`           | One project                       |
| `POST`   | `/projects`               | Create                            |
| `PATCH`  | `/projects/:id`           | Update                            |
| `DELETE` | `/projects/:id`           | Delete                            |
| `POST`   | `/tasks/:id/comments`     | Comment or reply                  |
| `PATCH`  | `/comments/:id`           | Edit own comment                  |
| `DELETE` | `/comments/:id`           | Delete own comment                |
| `POST`   | `/tasks/:id/resources`    | Attach a link                     |
| `DELETE` | `/resources/:id`          | Remove a link                     |

`GET /tasks` accepts `q`, `projectId`, `statusIds`, `priorities`,
`assigneeIds`, `labelIds`, `teamIds` (comma-separated) and `due`, which takes
`overdue`, `today`, `week` or `none`.

Validation is a global `ValidationPipe` with `whitelist` and
`forbidNonWhitelisted`, so unknown properties are rejected rather than
persisted.

---

## Running locally

Requires Node 22+ and a PostgreSQL database.

```bash
# API
cd apps/api
npm install
cp .env.example .env          # set DATABASE_URL and JWT_SECRET
npx prisma migrate dev
npm run start:dev             # http://localhost:3001

# Web, in a second terminal
cd apps/web
npm install
cp .env.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev                   # http://localhost:3000
```

Start the API first, since the web app calls it for guest login. Then open
`http://localhost:3000`, click **Continue as Guest**, and you land in a
workspace seeded to match the Figma board.

`NEXT_PUBLIC_API_URL` takes no trailing slash and no `/api` suffix, because the
client appends `/api` itself.

---

## Tests

```bash
cd apps/api && npm test
```

15 unit tests, no database required:

- **`tasks.service.spec.ts`** covers the position arithmetic in `move()`, which
  is the riskiest logic here and would corrupt board order if it were subtly
  wrong. It tests reordering up and down within a column, the gap-close and
  gap-open pair when a card changes column, that an activity entry is written
  only on a column change, and that every write lands in one transaction.
- **`create-task.dto.spec.ts`** covers DTO validation: empty titles, missing
  status, unknown priority and due-date presets, duplicate assignees, and the
  query-string coercion that turns `?statusIds=a,b,c` into an array while
  treating an empty value as absent rather than as one empty id.

---

## Deployment

- **Database:** Neon Postgres, free tier, survives redeploys.
- **API:** Render, from `render.yaml`. Set `DATABASE_URL` to the Neon string
  and `CORS_ORIGINS` to the Vercel origin.
- **Web:** Vercel, root directory `apps/web`, with `NEXT_PUBLIC_API_URL` set to
  the Render URL before the first build, since `NEXT_PUBLIC_` values are baked
  into the bundle.

> **Free-tier caveat:** a Render free web service spins down after about 15
> minutes idle and takes 30 to 60 seconds to cold start. An uptime pinger
> hitting `/api/health` every 10 minutes keeps it warm for the 45-day review
> window.

---

## Known limitations

- Test coverage stops at those two units. Controller and integration tests
  against a real database are the next thing I would add.
- Board column reordering is not wired up. The grip renders and the API
  supports `position`, but the drag handler is card-only.
- Comment editing exists in the API but has no UI entry point.
- Guest workspaces are never garbage-collected. A long-lived deployment would
  want a cleanup job for stale guests.
- Real-time collaboration, the presence cursor visible in screen 2, is not
  implemented.
