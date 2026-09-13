"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ActionForm } from "@/components/forms/ActionForm";
import { Field } from "@/components/forms/Field";
import { FormAlert } from "@/components/forms/FormAlert";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Input } from "@/components/ui/input";
import type { ActionState } from "@/lib/action-state";
import {
  confirmPasswordResetAction,
  loginAction,
  registerAction,
  requestPasswordResetAction,
} from "@/lib/actions/auth";

const initialState: ActionState = {};
const INPUT = "h-10";

export function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  return (
    <ActionForm action={formAction} className="grid gap-4">
      {notice && !state.error && <FormAlert state={{ message: notice }} />}
      <FormAlert state={state} />
      <input type="hidden" name="next" value={next} />
      <Field label="Email" htmlFor="email" error={state.fieldErrors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required className={INPUT} />
      </Field>
      <Field label="Password" htmlFor="password" error={state.fieldErrors?.password}>
        <Input id="password" name="password" type="password" autoComplete="current-password" required className={INPUT} />
      </Field>
      <Link href="/forgot-password" className="-mt-2 justify-self-end text-sm text-primary hover:underline">
        Forgot your password?
      </Link>
      <SubmitButton className="h-10" pending={pending} pendingLabel="Signing in…">
        Sign in
      </SubmitButton>
    </ActionForm>
  );
}

export function RegisterForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(registerAction, initialState);
  return (
    <ActionForm action={formAction} className="grid gap-4">
      <FormAlert state={state} />
      <input type="hidden" name="next" value={next} />
      <Field label="Name" htmlFor="name" error={state.fieldErrors?.name}>
        <Input id="name" name="name" autoComplete="name" required maxLength={100} className={INPUT} />
      </Field>
      <Field label="Email" htmlFor="email" error={state.fieldErrors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required className={INPUT} />
      </Field>
      <Field label="Password" htmlFor="password" error={state.fieldErrors?.password} hint="At least 8 characters">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={72}
          className={INPUT}
        />
      </Field>
      <Field label="Confirm password" htmlFor="confirmPassword" error={state.fieldErrors?.confirmPassword}>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          className={INPUT}
        />
      </Field>
      <SubmitButton className="h-10" pending={pending} pendingLabel="Creating account…">
        Create account
      </SubmitButton>
    </ActionForm>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, initialState);
  return (
    <ActionForm action={formAction} className="grid gap-4">
      <FormAlert state={state} />
      <Field label="Email" htmlFor="email" error={state.fieldErrors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required className={INPUT} />
      </Field>
      <SubmitButton className="h-10" pending={pending} pendingLabel="Sending…">
        Send reset link
      </SubmitButton>
    </ActionForm>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(confirmPasswordResetAction, initialState);
  return (
    <ActionForm action={formAction} className="grid gap-4">
      <FormAlert state={state} />
      <input type="hidden" name="token" value={token} />
      <Field label="New password" htmlFor="newPassword" error={state.fieldErrors?.newPassword} hint="At least 8 characters">
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={72}
          className={INPUT}
        />
      </Field>
      <Field label="Confirm new password" htmlFor="confirmPassword" error={state.fieldErrors?.confirmPassword}>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          className={INPUT}
        />
      </Field>
      <SubmitButton className="h-10" pending={pending} pendingLabel="Saving…">
        Set new password
      </SubmitButton>
    </ActionForm>
  );
}
