"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Archive, ArchiveRestore, Mail, MailOpen, Reply } from "lucide-react";

import { DeleteButton } from "@/components/admin/delete-button";
import { Badge } from "@/components/ui/badge";
import {
  deleteMessage,
  toggleMessageArchived,
  toggleMessageRead,
} from "@/lib/actions/messages";
import { projectTypes } from "@/lib/site-config";
import { cn, formatDate } from "@/lib/utils";
import type { Message } from "@/types/content";

function labelFor(
  options: readonly { value: string; label: string }[],
  value: string | null,
) {
  if (!value) return null;
  return options.find((option) => option.value === value)?.label ?? value;
}

function IconAction({
  action,
  id,
  label,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        aria-label={label}
        title={label}
        className="inline-grid size-8 place-items-center rounded-lg border border-hairline text-ink-subtle transition hover:border-accent/40 hover:text-accent"
      >
        {children}
      </button>
    </form>
  );
}

export function MessageList({ messages }: { messages: Message[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <ul className="space-y-3">
      {messages.map((message) => {
        const open = expanded === message.id;
        const projectType = labelFor(projectTypes, message.projectType);

        return (
          <li
            key={message.id}
            className={cn(
              "panel rounded-card transition",
              !message.read && "border-accent/30",
            )}
          >
            <div className="flex items-start justify-between gap-4 p-5">
              <button
                type="button"
                onClick={() => setExpanded(open ? null : message.id)}
                aria-expanded={open}
                className="min-w-0 flex-1 text-left"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "font-medium",
                      message.read ? "text-ink-muted" : "text-ink",
                    )}
                  >
                    {message.name}
                  </span>
                  {!message.read ? <Badge tone="accent">New</Badge> : null}
                  {message.archived ? <Badge tone="muted">Archived</Badge> : null}
                  {projectType ? <Badge tone="neutral">{projectType}</Badge> : null}
                </div>

                <p className="mt-1 truncate text-sm text-ink-subtle">
                  {message.email}
                  {message.company ? ` · ${message.company}` : ""}
                </p>

                {!open ? (
                  <p className="mt-2 line-clamp-1 text-sm text-ink-muted">
                    {message.message}
                  </p>
                ) : null}
              </button>

              <div className="flex shrink-0 flex-col items-end gap-2">
                <span className="text-xs text-ink-subtle">
                  {formatDate(message.createdAt)}
                </span>
                <div className="flex items-center gap-1.5">
                  <IconAction
                    action={toggleMessageRead}
                    id={message.id}
                    label={message.read ? "Mark as unread" : "Mark as read"}
                  >
                    {message.read ? (
                      <Mail className="size-3.5" />
                    ) : (
                      <MailOpen className="size-3.5" />
                    )}
                  </IconAction>

                  <IconAction
                    action={toggleMessageArchived}
                    id={message.id}
                    label={message.archived ? "Move back to inbox" : "Archive"}
                  >
                    {message.archived ? (
                      <ArchiveRestore className="size-3.5" />
                    ) : (
                      <Archive className="size-3.5" />
                    )}
                  </IconAction>

                  <DeleteButton action={deleteMessage} id={message.id} />
                </div>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-hairline p-5">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink-muted">
                      {message.message}
                    </p>
                    <a
                      href={`mailto:${message.email}?subject=${encodeURIComponent(
                        `Re: your enquiry`,
                      )}`}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg border border-hairline px-3.5 py-2 text-sm text-ink-muted transition hover:border-accent/40 hover:text-accent"
                    >
                      <Reply className="size-4" aria-hidden />
                      Reply by email
                    </a>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
