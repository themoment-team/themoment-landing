"use server";

import { headers } from "next/headers";

import type { ContactState } from "../model/state";

/* Where a message actually goes: Web3Forms, which mails it to
   yuchan.7im@gmail.com.

   That address appears nowhere in this file, and cannot — the Web3Forms API
   has no recipient field. The access key IS the destination: a key is issued
   to one address and everything submitted with it goes there. So the address
   is a property of WEB3FORMS_ACCESS_KEY, and moving the mail means issuing a
   new key rather than editing anything here.

   The handoff for this specified a Vercel Function writing into a Notion
   database, and ruled Web3Forms out on its free tier — 250 submissions a
   month. That limit still stands and is the thing to watch; it was traded
   for not having to build and wire a second Notion database. A contact form
   on a club's landing page is a long way from 250 a month, and if it ever
   is not, the shape of this file barely changes: everything below the fetch
   is transport-independent.

   It is a server action rather than the handoff's api/contact.js because
   this is Next.js now — the action already runs on the server, the browser
   posts to it with no fetch of our own, and it works with JavaScript turned
   off. Web3Forms can be called straight from a browser, but then the access
   key ships in the bundle for anyone to submit through; read here, it does
   not.

   Everything else the handoff asked for is kept: the honeypot, the too-fast
   check, per-IP throttling, and the field limits. */

const ENDPOINT = "https://api.web3forms.com/submit";

/* Long enough for anything anyone would type into a contact form, short
   enough that the field cannot be used to post a novel through it. */
const LIMITS = { name: 80, email: 160, message: 2000 };

/* A form filled and submitted inside three seconds was not typed by a
   person. */
const MIN_FILL_MS = 3000;

/* Best effort, and only for as long as this instance lives: a cold start
   forgets everything, and several instances each count their own. It is not
   a defence, it is a brake on one address emptying itself at the form in one
   go. Real spam gets Turnstile instead. */
const RATE = new Map<string, number[]>();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 3;

function tooMany(ip: string): boolean {
  const now = Date.now();
  const hits = (RATE.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  hits.push(now);
  RATE.set(ip, hits);

  /* Keep the map from growing without limit. */
  if (RATE.size > 500) {
    for (const [key, times] of RATE) {
      if (now - times[times.length - 1] > RATE_WINDOW_MS) RATE.delete(key);
    }
  }
  return hits.length > RATE_MAX;
}

const MESSAGE = {
  sent: "문의가 접수되었습니다. 확인 후 답변드리겠습니다.",
  error: "전송에 실패했습니다. 잠시 후 다시 시도해 주세요.",
  unwired: "문의 폼이 아직 연결되지 않았습니다. yuchan.7im@gmail.com 으로 보내주세요.",
  invalid: "이름, 이메일, 문의 내용을 모두 입력해 주세요.",
  badEmail: "이메일 주소를 다시 확인해 주세요.",
  throttled: "잠시 후 다시 시도해 주세요.",
};

const sent = (): ContactState => ({ status: "sent", message: MESSAGE.sent });

export async function sendContact(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;

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
  if (String(formData.get("company") ?? "").trim() !== "") return sent();

  /* Same silence for a form submitted faster than it can be typed. A missing
     or unreadable value skips the check rather than failing it, so an
     autofilled form from a real person still gets through. */
  const elapsed = Number(formData.get("elapsed"));
  if (Number.isFinite(elapsed) && elapsed > 0 && elapsed < MIN_FILL_MS) return sent();

  const name = String(formData.get("name") ?? "").trim().slice(0, LIMITS.name);
  const email = String(formData.get("email") ?? "").trim().slice(0, LIMITS.email);
  const message = String(formData.get("message") ?? "").trim().slice(0, LIMITS.message);

  /* The inputs are `required`, so this only catches whitespace and anything
     that reached the action without going through the browser. */
  if (!name || !email || !message) {
    return { status: "invalid", message: MESSAGE.invalid };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "invalid", message: MESSAGE.badEmail };
  }

  const forwarded = (await headers()).get("x-forwarded-for");
  const ip = forwarded?.split(",")[0].trim() || "unknown";
  if (tooMany(ip)) return { status: "throttled", message: MESSAGE.throttled };

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
      cache: "no-store",
    });

    /* Web3Forms answers 200 with { success: false } for a rejected key, so
       the status alone does not say whether it worked. */
    const body = (await res.json().catch(() => null)) as { success?: boolean; message?: string } | null;
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
