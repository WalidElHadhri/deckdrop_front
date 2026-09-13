"use client";

import { startTransition } from "react";

/**
 * A form for a `useActionState` action. React resets forms submitted through the `action` prop once the action
 * returns, even when it returns validation errors; dispatching from onSubmit keeps what the user typed.
 * The `action` prop stays set so the form still submits before hydration.
 */
export function ActionForm({
  action,
  ...props
}: Omit<React.ComponentProps<"form">, "action" | "onSubmit"> & { action: (formData: FormData) => void }) {
  return (
    <form
      {...props}
      action={action}
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget, (event.nativeEvent as SubmitEvent).submitter);
        startTransition(() => action(formData));
      }}
    />
  );
}
