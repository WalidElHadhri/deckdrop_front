import { CircleAlert, CircleCheck } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import type { ActionState } from "@/lib/action-state";

export function FormAlert({ state }: { state: ActionState }) {
  if (state.error) {
    return (
      <Alert variant="destructive">
        <CircleAlert />
        <AlertTitle>{state.error}</AlertTitle>
      </Alert>
    );
  }
  if (state.message) {
    return (
      <Alert>
        <CircleCheck />
        <AlertTitle>{state.message}</AlertTitle>
      </Alert>
    );
  }
  return null;
}
