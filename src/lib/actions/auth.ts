"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/auth/dal";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { changePasswordSchema, loginSchema } from "@/lib/validations";
import {
  failure,
  formDataToObject,
  success,
  validationFailed,
} from "@/lib/actions/helpers";
import type { FormState } from "@/lib/actions/types";
import { clientIp, rateLimit, resetRateLimit } from "@/lib/rate-limit";

const LOGIN_LIMIT = { max: 5, windowMs: 15 * 60 * 1000 };

/** Only same-origin relative paths, so `?next=` cannot become an open redirect. */
function safeRedirectTarget(value: FormDataEntryValue | null): string {
  const target = typeof value === "string" ? value : "";
  return target.startsWith("/") && !target.startsWith("//") ? target : "/admin";
}

export async function login(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = loginSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationFailed(parsed.error);
  }

  const { email, password } = parsed.data;

  // Throttle by account as well as by IP: an IP-only limit does nothing against
  // a distributed guess at one email, and an account-only limit lets one IP
  // spray many accounts.
  const ipKey = `login:ip:${await clientIp()}`;
  const accountKey = `login:account:${email.toLowerCase()}`;
  const byIp = rateLimit(ipKey, LOGIN_LIMIT);
  const byAccount = rateLimit(accountKey, LOGIN_LIMIT);

  if (byIp.limited || byAccount.limited) {
    const minutes = Math.max(byIp.retryAfterMinutes, byAccount.retryAfterMinutes);
    return failure(`Too many sign-in attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Hash against a dummy value when the account is missing so the response
  // time does not reveal which emails exist.
  const passwordHash =
    user?.passwordHash ?? "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv";
  const valid = await verifyPassword(password, passwordHash);

  if (!user || !valid) {
    return failure("That email and password combination is not recognised.");
  }

  resetRateLimit(ipKey);
  resetRateLimit(accountKey);

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  redirect(safeRedirectTarget(formData.get("next")));
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

export async function changePassword(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await assertAdmin();
  const parsed = changePasswordSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationFailed(parsed.error);
  }

  const record = await prisma.user.findUnique({ where: { id: user.id } });
  if (!record) {
    return failure("Account not found.");
  }

  const valid = await verifyPassword(parsed.data.currentPassword, record.passwordHash);
  if (!valid) {
    return failure("Your current password is incorrect.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  });

  return success("Password updated.");
}
