"use client";

import { Loader2, LogIn, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { login } from "@/lib/actions/auth";
import { useFormAction } from "@/hooks/use-form-action";

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Signing in…
        </>
      ) : (
        <>
          <LogIn className="size-4" />
          Sign in
        </>
      )}
    </Button>
  );
}

export function LoginForm({ next }: { next: string }) {
  const { state, formAction, pending, onSubmit } = useFormAction(login);

  return (
    <form action={formAction} onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      <Field label="Email" htmlFor="email" required error={state.errors?.email}>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          autoFocus
          placeholder="you@example.com"
          invalid={Boolean(state.errors?.email)}
        />
      </Field>

      <Field label="Password" htmlFor="password" required error={state.errors?.password}>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          invalid={Boolean(state.errors?.password)}
        />
      </Field>

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {state.message}
        </p>
      ) : null}

      <SubmitButton pending={pending} />
    </form>
  );
}
