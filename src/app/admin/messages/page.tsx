import { CheckCheck } from "lucide-react";

import { MessageList } from "@/components/admin/message-list";
import { AdminPageHeader, EmptyState } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { FilterChips } from "@/components/ui/filter-chips";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/url-controls";
import type { Prisma } from "@/generated/prisma/client";
import { markAllMessagesRead } from "@/lib/actions/messages";
import { requireAdmin } from "@/lib/auth/dal";
import { PAGE_SIZE, paginate, param } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

export default async function AdminMessagesPage(props: PageProps<"/admin/messages">) {
  await requireAdmin();

  const params = await props.searchParams;
  const view = param(params, "view");
  const q = param(params, "q");

  const search: Prisma.MessageWhereInput = q
    ? {
        OR: [
          { name: { contains: q } },
          { email: { contains: q } },
          { company: { contains: q } },
          { message: { contains: q } },
        ],
      }
    : {};

  const where: Prisma.MessageWhereInput = {
    ...search,
    ...(view === "archived" ? { archived: true } : { archived: false }),
    ...(view === "unread" ? { read: false } : {}),
  };

  const [inbox, unread, archived, matching] = await Promise.all([
    prisma.message.count({ where: { ...search, archived: false } }),
    prisma.message.count({ where: { ...search, archived: false, read: false } }),
    prisma.message.count({ where: { ...search, archived: true } }),
    prisma.message.count({ where }),
  ]);

  const info = paginate(matching, param(params, "page"), PAGE_SIZE.admin);
  const messages = await prisma.message.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: info.skip,
    take: info.take,
  });

  const everEmpty = !q && inbox === 0 && archived === 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Inbox"
        description="Enquiries sent through the contact form."
        action={
          unread > 0 ? (
            <form action={markAllMessagesRead}>
              <Button type="submit" variant="outline" size="sm">
                <CheckCheck className="size-4" />
                Mark all read
              </Button>
            </form>
          ) : null
        }
      />

      {everEmpty ? (
        <EmptyState
          title="No messages yet"
          description="New enquiries from the contact form will land here."
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <FilterChips
              path="/admin/messages"
              params={params}
              param="view"
              label="Filter messages"
              allLabel="Inbox"
              allCount={inbox}
              options={[
                { value: "unread", label: "Unread", count: unread },
                { value: "archived", label: "Archived", count: archived },
              ]}
            />
            <SearchInput placeholder="Search name, email or message…" className="sm:w-72" />
          </div>

          {messages.length === 0 ? (
            <div className="panel rounded-card p-10 text-center text-sm text-ink-muted">
              {q
                ? "No messages match that search."
                : view === "archived"
                  ? "Nothing archived."
                  : view === "unread"
                    ? "You're all caught up."
                    : "Inbox zero."}
            </div>
          ) : (
            <MessageList messages={messages} />
          )}

          <Pagination info={info} path="/admin/messages" params={params} label="messages" />
        </>
      )}
    </div>
  );
}
