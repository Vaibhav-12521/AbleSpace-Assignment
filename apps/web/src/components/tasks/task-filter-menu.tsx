'use client';

import {
  CalendarDays,
  Circle,
  Filter,
  Tag,
  User,
  Users,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusDot } from '@/components/ui/collapsible-section';
import { Avatar } from '@/components/ui/avatar';
import { PriorityIcon, PRIORITY_LABELS, PRIORITY_ORDER } from '@/components/ui/priority';
import { DUE_FILTERS, DUE_FILTER_LABELS, type TaskFilters } from '@/lib/api';
import type { Priority, WorkspaceBootstrap } from '@/lib/types';

export interface TaskFilterMenuProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  workspace: WorkspaceBootstrap | undefined;
}

type ArrayFilterKey = 'statusIds' | 'assigneeIds' | 'labelIds' | 'teamIds';

export function TaskFilterMenu({
  filters,
  onChange,
  workspace,
}: TaskFilterMenuProps) {
  const activeCount =
    (filters.statusIds?.length ?? 0) +
    (filters.priorities?.length ?? 0) +
    (filters.assigneeIds?.length ?? 0) +
    (filters.labelIds?.length ?? 0) +
    (filters.teamIds?.length ?? 0) +
    (filters.due ? 1 : 0);

  function toggleArray(key: ArrayFilterKey, value: string) {
    const current = filters[key] ?? [];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next.length ? next : undefined });
  }

  function togglePriority(value: Priority) {
    const current = filters.priorities ?? [];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    onChange({ ...filters, priorities: next.length ? next : undefined });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={activeCount > 0 ? 'md' : 'icon'}
          aria-label="Filter"
        >
          <Filter className="h-3.5 w-3.5" />
          {activeCount > 0 && (
            <span className="text-[12px] tabular-nums">{activeCount}</span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[170px]">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Circle />
            Status
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-[180px]">
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            {(workspace?.statuses ?? []).map((status) => (
              <DropdownMenuRadioItem
                key={status.id}
                checked={filters.statusIds?.includes(status.id) ?? false}
                onSelect={(event) => {
                  event.preventDefault();
                  toggleArray('statusIds', status.id);
                }}
              >
                <StatusDot color={status.color} />
                {status.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <BarChart3 />
            Priority
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-[160px]">
            <DropdownMenuLabel>Priority</DropdownMenuLabel>
            {PRIORITY_ORDER.map((priority) => (
              <DropdownMenuRadioItem
                key={priority}
                checked={filters.priorities?.includes(priority) ?? false}
                onSelect={(event) => {
                  event.preventDefault();
                  togglePriority(priority);
                }}
              >
                <PriorityIcon priority={priority} />
                {PRIORITY_LABELS[priority]}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <User />
            Members
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-[200px]">
            <DropdownMenuLabel>Members</DropdownMenuLabel>
            {(workspace?.members ?? []).map((member) => (
              <DropdownMenuRadioItem
                key={member.id}
                checked={filters.assigneeIds?.includes(member.id) ?? false}
                onSelect={(event) => {
                  event.preventDefault();
                  toggleArray('assigneeIds', member.id);
                }}
              >
                <Avatar name={member.name} src={member.avatarUrl} size="xs" />
                {member.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <CalendarDays />
            Due Date
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-[170px]">
            <DropdownMenuLabel>Due Date</DropdownMenuLabel>
            {DUE_FILTERS.map((preset) => (
              <DropdownMenuRadioItem
                key={preset}
                checked={filters.due === preset}
                onSelect={(event) => {
                  event.preventDefault();

                  onChange({
                    ...filters,
                    due: filters.due === preset ? undefined : preset,
                  });
                }}
              >
                {DUE_FILTER_LABELS[preset]}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Users />
            Teams
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-[180px]">
            <DropdownMenuLabel>Teams</DropdownMenuLabel>
            {(workspace?.teams ?? []).map((team) => (
              <DropdownMenuRadioItem
                key={team.id}
                checked={filters.teamIds?.includes(team.id) ?? false}
                onSelect={(event) => {
                  event.preventDefault();
                  toggleArray('teamIds', team.id);
                }}
              >
                {team.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Tag />
            Labels
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="max-h-[280px] w-[180px] overflow-y-auto">
            <DropdownMenuLabel>Labels</DropdownMenuLabel>
            {(workspace?.labels ?? []).map((label) => (
              <DropdownMenuRadioItem
                key={label.id}
                checked={filters.labelIds?.includes(label.id) ?? false}
                onSelect={(event) => {
                  event.preventDefault();
                  toggleArray('labelIds', label.id);
                }}
              >
                <StatusDot color={label.color} />
                {label.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {activeCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuRadioItem onSelect={() => onChange({})}>
              Clear all filters
            </DropdownMenuRadioItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
