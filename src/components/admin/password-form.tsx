"use client";

import { useEffect, useRef } from "react";

import { FormMessage, SubmitButton } from "@/components/admin/admin-form";
import { Field, Input } from "@/components/ui/field";
import { changePassword } from "@/lib/actions/auth";
import { useFormAction } from "@/hooks/use-form-action";

export function PasswordForm() {
  const { state, formAction, pending, onSubmit } = useFormAction(changePassword);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} onSubmit={onSubmit} className="space-y-5">
      <Field
        label="Current password"
        htmlFor="currentPassword"
        required
        error={state.errors?.currentPassword}
      >
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          invalid={Boolean(state.errors?.currentPassword)}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="New password"
          htmlFor="newPassword"
          required
          hint="At least 10 characters, with upper, lower and a number."
          error={state.errors?.newPassword}
        >
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            autoComplete="new-password"
            invalid={Boolean(state.errors?.newPassword)}
          />
        </Field>

        <Field
          label="Confirm new password"
          htmlFor="confirmPassword"
          required
          error={state.errors?.confirmPassword}
        >
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            invalid={Boolean(state.errors?.confirmPassword)}
          />
        </Field>
      </div>

      <FormMessage state={state} />
      <SubmitButton pending={pending} label="Update password" pendingLabel="Updating…" />
    </form>
  );
}
