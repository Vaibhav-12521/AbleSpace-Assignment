'use client';

import { useState } from 'react';
import { MoreHorizontal, Paperclip, SendHorizontal, SmilePlus } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatRelative } from '@/lib/date';
import type { Activity, Comment, User } from '@/lib/types';

export interface TaskCommentsProps {
  comments: Comment[];
  currentUser: User;
  onCreate: (input: { body: string; parentId?: string }) => void;
  onDelete: (id: string) => void;
}

export function TaskComments({
  comments,
  currentUser,
  onCreate,
  onDelete,
}: TaskCommentsProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-[13px] font-medium text-ink">Comments</h2>

      {comments.map((comment) => (
        <article
          key={comment.id}
          className="rounded-xl border border-line bg-surface"
        >
          <div className="flex items-start gap-2 px-3 py-2.5">
            <Avatar
              name={comment.author.name}
              src={comment.author.avatarUrl}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5">
                <span className="text-[12px] font-medium text-ink">
                  {comment.author.name}
                </span>
                <span className="text-[11px] text-ink-subtle">
                  {formatRelative(comment.createdAt)}
                </span>
              </p>
              <p className="mt-1 text-[13px] break-words whitespace-pre-wrap text-ink">
                {comment.body}
              </p>
            </div>

            <span className="flex items-center gap-0.5 text-ink-muted">
              <SmilePlus className="h-3.5 w-3.5" />
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Comment actions"
                  className="inline-flex h-5 w-5 items-center justify-center rounded-md transition-colors hover:bg-surface-hover hover:text-ink"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-danger"
                    disabled={comment.author.id !== currentUser.id}
                    onSelect={() => onDelete(comment.id)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </span>
          </div>

          {(comment.replies ?? []).map((reply) => (
            <div
              key={reply.id}
              className="flex items-start gap-2 border-t border-line-subtle px-3 py-2.5 pl-10"
            >
              <Avatar
                name={reply.author.name}
                src={reply.author.avatarUrl}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5">
                  <span className="text-[12px] font-medium text-ink">
                    {reply.author.name}
                  </span>
                  <span className="text-[11px] text-ink-subtle">
                    {formatRelative(reply.createdAt)}
                  </span>
                </p>
                <p className="mt-1 text-[13px] break-words whitespace-pre-wrap text-ink">
                  {reply.body}
                </p>
              </div>
            </div>
          ))}

          <div className="border-t border-line-subtle px-3 py-2">
            <Composer
              user={currentUser}
              placeholder="Leave a reply..."
              onSubmit={(body) => onCreate({ body, parentId: comment.id })}
            />
          </div>
        </article>
      ))}

      <div className="rounded-xl border border-line bg-surface px-3 py-2">
        <Composer
          user={currentUser}
          placeholder="Add a comment..."
          showAvatar={false}
          onSubmit={(body) => onCreate({ body })}
        />
      </div>
    </section>
  );
}

function Composer({
  user,
  placeholder,
  showAvatar = true,
  onSubmit,
}: {
  user: User;
  placeholder: string;
  showAvatar?: boolean;
  onSubmit: (body: string) => void;
}) {
  const [value, setValue] = useState('');

  function submit() {
    const body = value.trim();
    if (!body) return;
    onSubmit(body);
    setValue('');
  }

  return (
    <div className="flex items-center gap-2">
      {showAvatar && <Avatar name={user.name} src={user.avatarUrl} size="sm" />}

      <input
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
        className="min-w-0 flex-1 bg-transparent text-[13px] text-ink placeholder:text-ink-subtle focus:outline-none"
      />

      <Paperclip className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
      <button
        type="button"
        aria-label="Send"
        onClick={submit}
        disabled={!value.trim()}
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-ink-muted transition-colors hover:text-ink disabled:opacity-40"
      >
        <SendHorizontal className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function TaskUpdates({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) return null;

  return (
    <section className="rounded-xl border border-line bg-surface">
      <header className="border-b border-line-subtle px-3 py-2">
        <h2 className="text-[13px] font-medium text-ink">Updates</h2>
      </header>

      <ol className="divide-y divide-line-subtle">
        {activities.map((activity) => (
          <li key={activity.id} className="flex items-start gap-2 px-3 py-2">
            <Avatar
              name={activity.user?.name ?? 'System'}
              src={activity.user?.avatarUrl}
              size="sm"
            />
            <p className="min-w-0 flex-1 text-[12px] leading-snug text-ink-muted">
              <span className="font-medium text-ink">
                {activity.user?.name ?? 'System'}
              </span>{' '}
              {activity.message}
              <span className="text-ink-subtle">
                {' · '}
                {formatRelative(activity.createdAt)}
              </span>
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
