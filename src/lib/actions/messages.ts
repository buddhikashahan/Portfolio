"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/auth/dal";

function revalidateInbox() {
  revalidatePath("/admin");
  revalidatePath("/admin/messages");
}

export async function toggleMessageRead(formData: FormData) {
  await assertAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  const message = await prisma.message.findUnique({
    where: { id },
    select: { read: true },
  });
  if (!message) return;

  await prisma.message.update({ where: { id }, data: { read: !message.read } });
  revalidateInbox();
}

export async function toggleMessageArchived(formData: FormData) {
  await assertAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  const message = await prisma.message.findUnique({
    where: { id },
    select: { archived: true },
  });
  if (!message) return;

  // Archiving also marks as read: an archived message needs no further triage.
  await prisma.message.update({
    where: { id },
    data: { archived: !message.archived, read: true },
  });
  revalidateInbox();
}

export async function deleteMessage(formData: FormData) {
  await assertAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  await prisma.message.delete({ where: { id } });
  revalidateInbox();
}

export async function markAllMessagesRead() {
  await assertAdmin();

  await prisma.message.updateMany({
    where: { read: false },
    data: { read: true },
  });
  revalidateInbox();
}
