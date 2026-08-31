"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Reveal from "@/shared/ui/Reveal";
import RevealGroup from "@/shared/ui/RevealGroup";
import { BEAT, GROUP, beat } from "@/shared/lib/timing";
import { INITIAL_CONTACT_STATE, sendContact } from "../api/sendContact";

/* The three fields the comp draws, with the line above each one that says
   what it is for. autoComplete is what lets a browser fill the first two
   from what it already knows, which is the difference between a form
   answered in a second and one typed out. */
const FIELDS = [
  {
    key: "name",
    type: "text",
    autoComplete: "name",
    label: "성함을 입력해주세요",
    placeholder: "홍길동",
  },
  {
    key: "email",
    type: "email",
    autoComplete: "email",
    label: "연락드릴 이메일을 입력해주세요",
    placeholder: "hongildong@gmail.com",
  },
  {
    key: "message",
    type: "textarea",
    autoComplete: "off",
    label: "컨택 내용을 입력해주세요",
    placeholder: "Server part로 팀 합류를 원합니다",
  },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];

const EMPTY: Record<FieldKey, string> = { name: "", email: "", message: "" };

const fieldClass =
  "w-full border border-line bg-glass px-3 py-3 text-label font-medium text-white " +
  "outline-none transition-colors duration-500 ease-out " +
  "placeholder:text-muted hover:border-line-strong " +
  "focus:border-accent focus:bg-glass-lit";

/* The message box grows with what is typed into it rather than handing the
   visitor a drag handle. A textarea has no intrinsic way to do this, and the
   height has to be cleared before scrollHeight is read: scrollHeight never
   reports less than the height already set, so measuring without the reset
   gives a box that only ever gets taller. */
function autoGrow(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

/* Its own component so it can read the pending state of the form above it.
   useFormStatus only reports for a form an ancestor of the component that
   calls it, which is why this is not inlined. */
function SubmitButton({ ready }: { ready: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      /* Off until there is something to send. The action validates again on
         the server — this is only so the button stops inviting a press that
         could not go anywhere. */
      disabled={!ready || pending}
      className="w-full bg-accent px-8 py-4 text-label font-semibold text-white transition-[background-color,opacity] duration-500 ease-out hover:bg-white hover:text-ink focus-visible:bg-white focus-visible:text-ink focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-accent disabled:hover:text-white"
    >
      {pending ? "보내는 중" : "보내기"}
    </button>
  );
}

/* The comp has no submit button — three fields and nothing to press. So the
   button is built here, in the page's own language: the one blue on the
   page, inverting to white on hover the way the links do, and the width of
   the form it belongs to. */
export default function ContactSection() {
  const [state, formAction] = useActionState(sendContact, INITIAL_CONTACT_STATE);
  const [values, setValues] = useState(EMPTY);

  /* When the form was first touched, for the action's too-fast check. Kept
     in a ref and written straight onto a hidden input: it is not something
     the page renders, and putting it in state would re-render on every
     keystroke for nothing. */
  const startedAt = useRef(0);
  const elapsedRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const ready = FIELDS.every((field) => values[field.key].trim() !== "");

  const handleChange = (key: FieldKey) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!startedAt.current) startedAt.current = Date.now();
    setValues((prev) => ({ ...prev, [key]: event.target.value }));
  };

  /* Written after the render rather than inside the change handler, where
     the ref is not guaranteed to be attached yet — it was being set on a
     node that did not exist, and the field went to the server empty. */
  useEffect(() => {
    if (!elapsedRef.current) return;
    elapsedRef.current.value = startedAt.current ? String(Date.now() - startedAt.current) : "";
  }, [values]);

  /* React clears an uncontrolled form itself once an action succeeds; these
     are controlled, so they are cleared here — along with the message box's
     measured height, which would otherwise stay at the size of a letter that
     has already been sent. */
  useEffect(() => {
    if (state.status !== "sent") return;
    setValues(EMPTY);
    startedAt.current = 0;
    if (messageRef.current) messageRef.current.style.height = "";
  }, [state]);

  return (
    <section id="contact" className="relative flex min-h-dvh w-full flex-col bg-veil">
      <RevealGroup className="mx-auto flex w-full grow flex-col justify-center items-center px-gutter py-block">
        <Reveal as="h2" className="text-display font-bold text-white">
          Contact
        </Reveal>
        <Reveal as="p" delay={BEAT} className="mt-stack text-center text-body font-medium text-white">
          협업, 합류, 의뢰 등 무엇이던지 고민하지 마세요
          <br />
          <span className="text-accent">더모먼트</span>와 함께 순간을 혁신하세요
        </Reveal>

        {/* 600 wide in the comp, centred in the column. */}
        <form action={formAction} className="mt-block flex w-full max-w-[600px] flex-col gap-stack">
          {FIELDS.map((field, i) => {
            const id = `contact-${field.key}`;
            return (
              <Reveal key={field.key} delay={beat(i, GROUP)} className="flex w-full flex-col gap-2">
                <label htmlFor={id} className="text-label font-medium text-white">
                  {field.label}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    ref={messageRef}
                    id={id}
                    name={field.key}
                    rows={5}
                    required
                    placeholder={field.placeholder}
                    value={values[field.key]}
                    onChange={handleChange(field.key)}
                    onInput={(e) => autoGrow(e.currentTarget)}
                    /* overflow-hidden goes with the growing: the box is
                       always as tall as its content, so there is nothing to
                       scroll, and a bar flickering in on the line that
                       overflows would undo the point of it. resize-none for
                       the same reason — a handle would be a second answer to
                       a question the box already answers. */
                    className={`${fieldClass} min-h-[120px] resize-none overflow-hidden`}
                  />
                ) : (
                  <input
                    id={id}
                    name={field.key}
                    type={field.type}
                    required
                    autoComplete={field.autoComplete}
                    placeholder={field.placeholder}
                    value={values[field.key]}
                    onChange={handleChange(field.key)}
                    className={fieldClass}
                  />
                )}
              </Reveal>
            );
          })}

          {/* The honeypot. Pushed off-screen rather than display:none —
              there are bots that skip hidden fields and fill everything
              else. Nobody who can see the page can reach it, so anything in
              it came from something that was not looking. */}
          <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor="contact-company">Company</label>
            <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          <input ref={elapsedRef} type="hidden" name="elapsed" defaultValue="" />

          <Reveal delay={beat(FIELDS.length, GROUP)} className="flex flex-col gap-3">
            <SubmitButton ready={ready} />
            {/* One line for every outcome, held in the live region the whole
                time rather than mounted when there is news — a region that
                arrives with its text already in it is one screen readers may
                never announce. Failures are set in white rather than the
                brand blue so success and failure do not read alike at a
                glance; the words carry it either way, for anyone who cannot
                tell the two colours apart. */}
            <p
              role="status"
              aria-live="polite"
              className={`text-label font-medium transition-opacity duration-500 ease-out sm:text-right ${
                state.status === "sent" ? "text-accent" : "text-white"
              } ${state.message ? "opacity-100" : "opacity-0"}`}
            >
              {state.message || " "}
            </p>
          </Reveal>
        </form>
      </RevealGroup>
    </section>
  );
}
