"use server";

/* Where a message actually goes.

   The old form read its endpoint from a VITE_ variable, which meant the URL
   was compiled into the bundle for anyone to read and could never hold a
   key. Here the endpoint is read inside a server action: the browser posts
   to this app, this app posts onward, and the destination never appears in
   any response. Any service that accepts a JSON POST will do.

   With nothing configured the form says so. It must never clear its own
   fields and report success while posting nowhere, which is the one thing a
   contact form cannot get wrong. */

export type ContactState = {
  status: "idle" | "sent" | "error" | "unwired" | "invalid";
  message: string;
};

export const INITIAL_CONTACT_STATE: ContactState = { status: "idle", message: "" };

const MESSAGE = {
  sent: "문의가 접수되었습니다. 확인 후 답변드리겠습니다.",
  error: "전송에 실패했습니다. 잠시 후 다시 시도해 주세요.",
  unwired: "문의 폼이 아직 연결되지 않았습니다. team.the.moment@gmail.com 으로 보내주세요.",
  invalid: "이름, 이메일, 문의 내용을 모두 입력해 주세요.",
};

export async function sendContact(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const endpoint = process.env.CONTACT_ENDPOINT;

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  /* The inputs are `required`, so this only catches whitespace and anything
     that reached the action without going through the browser. */
  if (!name || !email || !message) {
    return { status: "invalid", message: MESSAGE.invalid };
  }

  if (!endpoint) {
    return { status: "unwired", message: MESSAGE.unwired };
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ name, email, message }),
      /* A form post is the one thing on this site that must never be served
         from a cache. */
      cache: "no-store",
    });

    /* Anything but a 2xx is a failure the visitor has to be told about,
       including the ones a form service answers with a 200-looking body. */
    if (!res.ok) throw new Error(String(res.status));
    return { status: "sent", message: MESSAGE.sent };
  } catch (err) {
    console.error("[contact]", err instanceof Error ? err.message : err);
    return { status: "error", message: MESSAGE.error };
  }
}
