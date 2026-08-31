/* What the form knows about its last attempt.

   This lives apart from the action rather than beside it because a
   "use server" file may only export async functions — every other export is
   turned into a server action reference, and a plain object cannot be one.
   Exporting the initial state from there threw "A 'use server' file can only
   export async functions, found object" the first time anyone pressed Send.

   Nothing catches it earlier: the page is prerendered and the action module
   is not evaluated until an action is actually invoked, so the build passes
   and the form is the only thing that fails. */
export type ContactState = {
  status: "idle" | "sent" | "error" | "unwired" | "invalid" | "throttled";
  message: string;
};

export const INITIAL_CONTACT_STATE: ContactState = { status: "idle", message: "" };
