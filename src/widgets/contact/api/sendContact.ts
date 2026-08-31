import type { ContactState } from "../model/state";

/* Where a message actually goes: Web3Forms, which mails it to
   yuchan.7im@gmail.com.

   That address appears nowhere in this file, and cannot — the Web3Forms API
   has no recipient field. The access key IS the destination: a key is issued
   to one address and everything submitted with it goes there. So the address
   is a property of WEB3FORMS_ACCESS_KEY, and moving the mail means issuing a
   new key rather than editing anything here.

   This runs in the browser, which is the part that matters. It was a server
   action posting to the API from the Vercel function, so that the key never
   reached the page — and Web3Forms answered every one of those 403, with no
   body to say why. That is deliberate on their side: the API is documented
   as client-side only, "expected to run on client side for spam prevention",
   and a server-side call wants the calling IP safelisted on a paid plan.
   Nothing about the request was wrong; the caller was. It is invisible in
   development, because a laptop's own address is not the one being refused.

   So the key is public now, and that is the model Web3Forms is built on —
   their own examples put it in the HTML. It is not a credential: it names a
   destination, cannot read anything back, and the worst it allows is posting
   through this form, which is what the two checks below and Web3Forms' own
   spam filter are for. It is still read from the environment on the server
   and handed down as a prop, so changing where the mail goes stays a change
   to the environment rather than to the code.

   What went with the server action: submitting with JavaScript turned off,
   and per-IP throttling. The first is a real loss, and the address in the
   footer is the answer to it. The second was only ever a brake on one
   visitor emptying themselves at the form, and Web3Forms throttles for us. */

const ENDPOINT = "https://api.web3forms.com/submit";

/* Long enough for anything anyone would type into a contact form, short
   enough that the field cannot be used to post a novel through it. */
const LIMITS = { name: 80, email: 160, message: 2000 };

/* A form filled and submitted inside three seconds was not typed by a
   person. */
const MIN_FILL_MS = 3000;

const MESSAGE = {
  sent: "문의가 접수되었습니다. 확인 후 답변드리겠습니다.",
  error: "전송에 실패했습니다. 잠시 후 다시 시도해 주세요.",
  unwired: "문의 폼이 아직 연결되지 않았습니다. yuchan.7im@gmail.com 으로 보내주세요.",
  invalid: "이름, 이메일, 문의 내용을 모두 입력해 주세요.",
  badEmail: "이메일 주소를 다시 확인해 주세요.",
};

const sent = (): ContactState => ({ status: "sent", message: MESSAGE.sent });

export type ContactFields = {
  name: string;
  email: string;
  message: string;
  /* The honeypot's field, and how long the form was open before it was
     sent. Neither is anything the visitor filled in on purpose. */
  company: string;
  elapsed: number;
};

export async function sendContact(
  accessKey: string | null,
  fields: ContactFields,
): Promise<ContactState> {
  /* Nothing configured. The form says so rather than clearing its fields and
     reporting a success that went nowhere, which is the one thing a contact
     form must not get wrong. */
  if (!accessKey) {
    console.warn("[contact] WEB3FORMS_ACCESS_KEY not set — see .env.example");
    return { status: "unwired", message: MESSAGE.unwired };
  }

  /* The honeypot: a field held off-screen that nobody can see to fill in.
     Answered as though it worked — telling a bot it was caught only teaches
     it what to change. */
  if (fields.company.trim() !== "") return sent();

  /* Same silence for a form submitted faster than it can be typed. A missing
     or unreadable value skips the check rather than failing it, so an
     autofilled form from a real person still gets through. */
  if (Number.isFinite(fields.elapsed) && fields.elapsed > 0 && fields.elapsed < MIN_FILL_MS) {
    return sent();
  }

  const name = fields.name.trim().slice(0, LIMITS.name);
  const email = fields.email.trim().slice(0, LIMITS.email);
  const message = fields.message.trim().slice(0, LIMITS.message);

  /* The inputs are `required`, so this only catches whitespace. */
  if (!name || !email || !message) {
    return { status: "invalid", message: MESSAGE.invalid };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "invalid", message: MESSAGE.badEmail };
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        /* What lands in the inbox: a subject that says which form it came
           from, and a reply-to of the person who wrote it, so hitting reply
           in a mail client goes to them and not to Web3Forms. */
        subject: `[더모먼트] ${name}님의 문의`,
        from_name: "THE MOMENT 랜딩",
        replyto: email,
        name,
        email,
        message,
      }),
    });

    /* Web3Forms answers 200 with { success: false } for a rejected key, so
       the status alone does not say whether it worked — and the refusals
       that are not about the form at all, the 403 above among them, come
       back with no JSON to read. Both land here. */
    const body = (await res.json().catch(() => null)) as
      | { success?: boolean; message?: string }
      | null;
    if (!res.ok || !body?.success) {
      console.error("[contact] web3forms", res.status, body?.message ?? "(no body)");
      return { status: "error", message: MESSAGE.error };
    }
  } catch (err) {
    console.error("[contact]", err instanceof Error ? err.message : err);
    return { status: "error", message: MESSAGE.error };
  }

  return sent();
}
