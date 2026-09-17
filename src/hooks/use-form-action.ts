"use client";

import { startTransition, useActionState, type FormEvent } from "react";

import { idleFormState, type FormState } from "@/lib/actions/types";

type Action = (state: FormState, formData: FormData) => Promise<FormState>;

/**
 * `useActionState` without React's automatic form reset.
 *
 * Passing a function to `<form action>` makes React reset every uncontrolled
 * field once the action settles — including when the server rejected the input.
 * The user fixes one typo and loses everything else they entered. Dispatching
 * from `onSubmit` instead skips that reset, so fields keep their values and the
 * form only clears when a caller decides it should (e.g. after a successful send).
 *
 * Keep `action={formAction}` on the form as well: it is what submits the form
 * before JavaScript has loaded, and `onSubmit` takes over once it has.
 */
export function useFormAction(action: Action) {
  const [state, formAction, pending] = useActionState(action, idleFormState);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Include the clicked button's name/value, as a native submission would.
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const formData = new FormData(event.currentTarget, submitter);
    startTransition(() => formAction(formData));
  }

  return { state, formAction, pending, onSubmit };
}
