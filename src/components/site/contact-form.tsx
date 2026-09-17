"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2, Loader2, Send, TriangleAlert } from "lucide-react";

import { Field, Input, Textarea } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { submitContactForm } from "@/lib/actions/contact";
import { useFormAction } from "@/hooks/use-form-action";
import { projectTypes } from "@/lib/site-config";

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Sending…
        </>
      ) : (
        <>
          <Send className="size-4" />
          Send message
        </>
      )}
    </Button>
  );
}

export function ContactForm() {
  const { state, formAction, pending, onSubmit } = useFormAction(submitContactForm);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the form only once the server confirms it stored the message.
  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} onSubmit={onSubmit} className="panel rounded-panel p-6 sm:p-8">
      <div className="space-y-5">
        <Field label="Your name" htmlFor="name" required error={state.errors?.name}>
          <Input
            id="name"
            name="name"
            required
            autoComplete="name"
            placeholder="Jane Fernando"
            invalid={Boolean(state.errors?.name)}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Email" htmlFor="email" required error={state.errors?.email}>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="jane@company.com"
              invalid={Boolean(state.errors?.email)}
            />
          </Field>

          <Field label="Company" htmlFor="company" error={state.errors?.company}>
            <Input
              id="company"
              name="company"
              autoComplete="organization"
              placeholder="Optional"
            />
          </Field>
        </div>

        <Field label="Project type" htmlFor="projectType">
          <Select
            id="projectType"
            name="projectType"
            placeholder="Select a type…"
            options={projectTypes.map((type) => ({
              value: type.value,
              label: type.label,
            }))}
          />
        </Field>

        <Field
          label="Tell me about the project"
          htmlFor="message"
          required
          hint="What are you building, who is it for, and when do you need it?"
          error={state.errors?.message}
        >
          <Textarea
            id="message"
            name="message"
            rows={6}
            required
            placeholder="We need a customer portal built on top of our existing API…"
            invalid={Boolean(state.errors?.message)}
          />
        </Field>

        {/* Honeypot: visually hidden and skipped by keyboard, so only bots fill it. */}
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        {state.status !== "idle" && state.message ? (
          <p
            role="status"
            className={
              state.status === "success"
                ? "flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400"
                : "flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"
            }
          >
            {state.status === "success" ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
            ) : (
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            )}
            {state.message}
          </p>
        ) : null}

        <SubmitButton pending={pending} />
      </div>
    </form>
  );
}
