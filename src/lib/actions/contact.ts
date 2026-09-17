"use server";

import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validations";
import {
  failure,
  formDataToObject,
  success,
  validationFailed,
} from "@/lib/actions/helpers";
import type { FormState } from "@/lib/actions/types";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function submitContactForm(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = contactSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return validationFailed(parsed.error, "Please check the highlighted fields.");
  }

  const { website, ...data } = parsed.data;

  // Honeypot tripped — accept silently so bots get no signal.
  if (website) {
    return success("Thanks! Your message has been sent.");
  }

  const { limited } = rateLimit(`contact:${await clientIp()}`, {
    max: 3,
    windowMs: 10 * 60 * 1000,
  });

  if (limited) {
    return failure("Too many messages from this connection. Try again in a few minutes.");
  }

  try {
    await prisma.message.create({ data });
  } catch (error) {
    console.error("Failed to store contact message", error);
    return failure("Something went wrong on my side. Please email me directly.");
  }

  return success("Thanks! Your message landed — I usually reply within a day.");
}
