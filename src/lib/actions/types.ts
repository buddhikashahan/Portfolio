export type FormState = {
  status: "idle" | "success" | "error";
  message: string;
  /** Field name -> first validation message, keyed to the form inputs. */
  errors?: Record<string, string>;
};

export const idleFormState: FormState = { status: "idle", message: "" };
