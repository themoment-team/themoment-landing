/* What the form knows about its last attempt. Its own file so that the
   section, the form, and the send all name the same thing. */
export type ContactState = {
  status: "idle" | "sent" | "error" | "unwired" | "invalid";
  message: string;
};

export const INITIAL_CONTACT_STATE: ContactState = { status: "idle", message: "" };
