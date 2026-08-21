'use client';

import { ArrowRight, CalendarDays, Plus, Settings2 } from 'lucide-react';
import { Avatar, AvatarGroup } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { StatusDot } from '@/components/ui/collapsible-section';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  PriorityIcon,
  PRIORITY_LABELS,
  PRIORITY_ORDER,
} from '@/components/ui/priority';
import { formatDateChip, toDateOnlyISO } from '@/lib/date';
import { cn } from '@/lib/cn';
import type { Priority, TaskDetail, WorkspaceBootstrap } from '@/lib/types';

export interface TaskDetailsPanelProps {
  task: TaskDetail;
  workspace: WorkspaceBootstrap | undefined;
  onPatch: (patch: {
    statusId?: string;
    priority?: Priority;
    assigneeIds?: string[];
    labelIds?: string[];
    teamIds?: string[];
    startDate?: string;
    dueDate?: string;
  }) => void;
}

export function TaskDetailsPanel({
  task,
  workspace,
  onPatch,
}: TaskDetailsPanelProps) {
  const assigneeIds = task.assignees.map((person) => person.id);
  const labelIds = task.labels.map((label) => label.id);
  const teamIds = task.teams.map((team) => team.id);

  return (
    <aside className="w-full shrink-0 space-y-4 lg:w-[280px]">
      <section className="rounded-xl border border-line bg-surface">
        <header className="flex items-center gap-1 border-b border-line-subtle px-3 py-2">
          <h2 className="flex-1 text-[13px] font-medium text-ink">Details</h2>
          <span className="flex items-center gap-0.5 text-ink-muted">
            <Plus className="h-3.5 w-3.5" />
            <Settings2 className="h-3.5 w-3.5" />
          </span>
        </header>

        <dl className="divide-y divide-line-subtle">
          <Row label="Status">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[12px] text-ink transition-colors hover:bg-surface-hover">
                <StatusDot color={task.status.color} />
                {task.status.name}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[170px]">
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                {(workspace?.statuses ?? []).map((status) => (
                  <DropdownMenuRadioItem
                    key={status.id}
                    checked={status.id === task.statusId}
                    onSelect={() => onPatch({ statusId: status.id })}
                  >
                    <StatusDot color={status.color} />
                    {status.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </Row>

          <Row label="Priority">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[12px] transition-colors hover:bg-surface-hover">
                <PriorityIcon priority={task.priority} />
                <span className={priorityTextClass(task.priority)}>
                  {PRIORITY_LABELS[task.priority]}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[160px]">
                <DropdownMenuLabel>Priority</DropdownMenuLabel>
                {PRIORITY_ORDER.map((priority) => (
                  <DropdownMenuRadioItem
                    key={priority}
                    checked={priority === task.priority}
                    onSelect={() => onPatch({ priority })}
                  >
                    <PriorityIcon priority={priority} />
                    <span className={priorityTextClass(priority)}>
                      {PRIORITY_LABELS[priority]}
                    </span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </Row>

          <Row label="Members">
            <MultiSelect
              trigger={
                task.assignees.length > 0 ? (
                  <AvatarGroup people={task.assignees} size="sm" max={4} />
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-muted">
                    <Plus className="h-3 w-3" />
                    Add members
                  </span>
                )
              }
              label="Members"
              options={(workspace?.members ?? []).map((member) => ({
                id: member.id,
                name: member.name,
                icon: (
                  <Avatar name={member.name} src={member.avatarUrl} size="xs" />
                ),
              }))}
              selected={assigneeIds}
              onToggle={(id) =>
                onPatch({ assigneeIds: toggle(assigneeIds, id) })
              }
            />
          </Row>

          <Row label="Dates">
            <span className="flex items-center gap-1">
              <DatePickerChip
                value={task.startDate}
                placeholder="Start"
                onChange={(iso) => onPatch({ startDate: iso })}
              />
              <ArrowRight className="h-3 w-3 text-ink-subtle" />
              <DatePickerChip
                value={task.dueDate}
                placeholder="End"
                onChange={(iso) => onPatch({ dueDate: iso })}
              />
            </span>
          </Row>

          <Row label="Labels">
            <MultiSelect
              trigger={
                task.labels.length > 0 ? (
                  <span className="text-[12px] text-ink">
                    {task.labels.length} selected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-muted">
                    <Plus className="h-3 w-3" />
                    Add labels
                  </span>
                )
              }
              label="Labels"
              options={(workspace?.labels ?? []).map((label) => ({
                id: label.id,
                name: label.name,
                icon: <StatusDot color={label.color} />,
              }))}
              selected={labelIds}
              onToggle={(id) => onPatch({ labelIds: toggle(labelIds, id) })}
            />
          </Row>

          <Row label="Teams">
            <MultiSelect
              trigger={
                task.teams.length > 0 ? (
                  <span className="text-[12px] text-ink">
                    {task.teams.map((team) => team.name).join(', ')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-muted">
                    <Plus className="h-3 w-3" />
                    Add teams
                  </span>
                )
              }
              label="Teams"
              options={(workspace?.teams ?? []).map((team) => ({
                id: team.id,
                name: team.name,
              }))}
              selected={teamIds}
              onToggle={(id) => onPatch({ teamIds: toggle(teamIds, id) })}
            />
          </Row>

          <Row label="Reporter">
            {task.reporter ? (
              <span className="inline-flex items-center gap-1.5 text-[12px] text-ink">
                <Avatar
                  name={task.reporter.name}
                  src={task.reporter.avatarUrl}
                  size="xs"
                />
                {task.reporter.name}
              </span>
            ) : (
              <span className="text-[12px] text-ink-subtle">-</span>
            )}
          </Row>
        </dl>
      </section>
    </aside>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <dt className="w-[70px] shrink-0 text-[12px] text-ink-muted">{label}</dt>
      <dd className="min-w-0 flex-1">{children}</dd>
    </div>
  );
}

function MultiSelect({
  trigger,
  label,
  options,
  selected,
  onToggle,
}: {
  trigger: React.ReactNode;
  label: string;
  options: Array<{ id: string; name: string; icon?: React.ReactNode }>;
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-md px-1.5 py-0.5 transition-colors hover:bg-surface-hover">
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-[280px] w-[200px] overflow-y-auto"
      >
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        {options.length === 0 && (
          <p className="px-2 py-1.5 text-[12px] text-ink-subtle">
            Nothing to choose yet
          </p>
        )}
        {options.map((option) => (
          <DropdownMenuRadioItem
            key={option.id}
            checked={selected.includes(option.id)}
            onSelect={(event) => {
              event.preventDefault();
              onToggle(option.id);
            }}
          >
            {option.icon}
            {option.name}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DatePickerChip({
  value,
  placeholder,
  onChange,
}: {
  value: string | null;
  placeholder: string;
  onChange: (iso: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          'inline-flex items-center gap-1 rounded-md border border-line px-1.5 py-0.5 text-[11px] transition-colors hover:bg-surface-hover',
          value ? 'text-ink' : 'text-ink-subtle',
        )}
      >
        <CalendarDays className="h-3 w-3" />
        {value ? formatDateChip(value) : placeholder}
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <Calendar
          selected={value ? new Date(value) : null}
          onSelect={(date) => onChange(toDateOnlyISO(date))}
        />
      </PopoverContent>
    </Popover>
  );
}

function priorityTextClass(priority: Priority) {
  return {
    NO_PRIORITY: 'text-ink-muted',
    URGENT: 'text-priority-urgent',
    HIGH: 'text-priority-high',
    MEDIUM: 'text-priority-medium',
    LOW: 'text-priority-low',
  }[priority];
}

function toggle(list: string[], id: string) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}
