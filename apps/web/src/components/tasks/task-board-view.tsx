'use client';

import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MoreHorizontal, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { TaskCard } from './task-card';
import { InlineTaskInput } from './inline-task-input';
import { StatusDot } from '@/components/ui/collapsible-section';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Status, Task } from '@/lib/types';
import type { FieldMap } from '@/hooks/use-view-preferences';

export interface TaskBoardViewProps {
  statuses: Status[];
  tasks: Task[];
  fields: FieldMap;
  onCreateTask: (statusId: string, title: string) => void;
  onDeleteTask: (task: Task) => void;
  onMoveTask: (input: { id: string; statusId: string; position: number }) => void;
  onDeleteStatus?: (status: Status) => void;
}

/**
 * Board layout from screen 2.
 *
 * Columns are #f5f5f5 containers holding white cards; drag-and-drop is
 * @dnd-kit with a sortable context per column, so a card can be reordered
 * inside a column or dropped into another one.
 */
export function TaskBoardView({
  statuses,
  tasks,
  fields,
  onCreateTask,
  onDeleteTask,
  onMoveTask,
  onDeleteStatus,
}: TaskBoardViewProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const sensors = useSensors(
    // A small distance threshold keeps a click on the card's link from
    // being swallowed as a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const byStatus = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const status of statuses) map.set(status.id, []);
    for (const task of tasks) {
      const bucket = map.get(task.statusId);
      if (bucket) bucket.push(task);
    }
    for (const bucket of map.values()) {
      bucket.sort((a, b) => a.position - b.position);
    }
    return map;
  }, [statuses, tasks]);

  const draggingTask = draggingId
    ? (tasks.find((task) => task.id === draggingId) ?? null)
    : null;

  function handleDragStart(event: DragStartEvent) {
    setDraggingId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setDraggingId(null);
    if (!over) return;

    const activeId = String(active.id);
    const task = tasks.find((candidate) => candidate.id === activeId);
    if (!task) return;

    const target = resolveDropTarget(String(over.id), byStatus, statuses);
    if (!target) return;

    const siblings = byStatus.get(target.statusId) ?? [];
    const currentIndex = siblings.findIndex((s) => s.id === activeId);

    let position = target.index;

    // Dropping onto a card in the same column: account for the moving card
    // vacating its own slot before the insert point.
    if (task.statusId === target.statusId && currentIndex !== -1) {
      if (currentIndex === position) return;
      if (currentIndex < position) position -= 1;
    }

    if (task.statusId === target.statusId && task.position === position) return;

    onMoveTask({ id: activeId, statusId: target.statusId, position });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDraggingId(null)}
    >
      <div className="flex flex-1 gap-4 overflow-x-auto px-4 pb-10 sm:px-6">
        {statuses.map((status) => (
          <BoardColumn
            key={status.id}
            status={status}
            tasks={byStatus.get(status.id) ?? []}
            fields={fields}
            onCreateTask={onCreateTask}
            onDeleteTask={onDeleteTask}
            onDeleteStatus={onDeleteStatus}
          />
        ))}
      </div>

      {/* Rendered in a portal-like overlay so the card follows the cursor
          without the column's overflow clipping it. */}
      <DragOverlay dropAnimation={null}>
        {draggingTask && (
          <div className="w-[260px]">
            <TaskCard
              task={draggingTask}
              fields={fields}
              onDelete={() => {}}
              dragging
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

function BoardColumn({
  status,
  tasks,
  fields,
  onCreateTask,
  onDeleteTask,
  onDeleteStatus,
}: {
  status: Status;
  tasks: Task[];
  fields: FieldMap;
  onCreateTask: (statusId: string, title: string) => void;
  onDeleteTask: (task: Task) => void;
  onDeleteStatus?: (status: Status) => void;
}) {
  const [adding, setAdding] = useState(false);

  // Makes the column itself a drop target so empty columns still accept cards.
  const { setNodeRef, isOver } = useDroppable({
    id: `column:${status.id}`,
    data: { type: 'column', statusId: status.id },
  });

  return (
    <section
      ref={setNodeRef}
      className={cn(
        'flex w-[280px] shrink-0 flex-col gap-2.5 self-start rounded-xl bg-surface-subtle p-2.5 transition-colors',
        isOver && 'ring-1 ring-accent/40',
      )}
    >
      <header className="flex items-center gap-1.5 px-0.5">
        <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-ink-subtle" />
        <StatusDot color={status.color} />
        <h2 className="flex-1 truncate text-[12px] font-medium text-ink">
          {status.name}
        </h2>
        <span className="text-[11px] text-ink-subtle">{tasks.length}</span>

        <button
          type="button"
          aria-label={`Add task to ${status.name}`}
          onClick={() => setAdding(true)}
          className="inline-flex h-5 w-5 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Actions for ${status.name}`}
            className="inline-flex h-5 w-5 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setAdding(true)}>
              Add task
            </DropdownMenuItem>
            {onDeleteStatus && (
              <DropdownMenuItem
                className="text-danger"
                onSelect={() => onDeleteStatus(status)}
              >
                Delete column
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2.5">
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              fields={fields}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      </SortableContext>

      {adding ? (
        <InlineTaskInput
          onCancel={() => setAdding(false)}
          onSubmit={(title) => {
            onCreateTask(status.id, title);
            setAdding(false);
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1.5 rounded-md px-1 py-1 text-[12px] text-ink-muted transition-colors hover:text-ink"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Task
        </button>
      )}
    </section>
  );
}

function SortableTaskCard({
  task,
  fields,
  onDelete,
}: {
  task: Task;
  fields: FieldMap;
  onDelete: (task: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, data: { type: 'task', statusId: task.statusId } });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      // The original slot fades while its overlay copy is under the cursor.
      className={cn(isDragging && 'opacity-40')}
      {...attributes}
      {...listeners}
    >
      <TaskCard task={task} fields={fields} onDelete={onDelete} />
    </div>
  );
}

/**
 * Turns whatever the pointer released over into a column plus an insert index.
 * `over` is either a card id (drop between cards) or a `column:<id>` sentinel
 * (drop into empty space at the end of a column).
 */
function resolveDropTarget(
  overId: string,
  byStatus: Map<string, Task[]>,
  statuses: Status[],
): { statusId: string; index: number } | null {
  if (overId.startsWith('column:')) {
    const statusId = overId.slice('column:'.length);
    if (!byStatus.has(statusId)) return null;
    return { statusId, index: byStatus.get(statusId)?.length ?? 0 };
  }

  for (const status of statuses) {
    const siblings = byStatus.get(status.id) ?? [];
    const index = siblings.findIndex((task) => task.id === overId);
    if (index !== -1) return { statusId: status.id, index };
  }

  return null;
}
