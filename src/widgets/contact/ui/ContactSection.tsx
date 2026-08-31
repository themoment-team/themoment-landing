"use client";

import { useActionState } from "react";
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

const fieldClass =
  "w-full border border-line bg-glass px-3 py-3 text-label font-medium text-white " +
  "outline-none transition-colors duration-500 ease-out " +
  "placeholder:text-muted hover:border-line-strong " +
  "focus:border-accent focus:bg-glass-lit";

/* The message box grows with what is typed into it rather than handing the
   visitor a drag handle. A textarea has no intrinsic way to do this, and the
   height has to be cleared before scrollHeight is read: scrollHeight never
   reports less than the height already set, so measuring without the reset
   gives a box that only ever gets taller.

   resize-none goes with it. Leaving the handle on a box that sizes itself
   gives two answers to the same question, and a box dragged smaller would be
   undone by the next keystroke. */
function autoGrow(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

/* Its own component so it can read the pending state of the form above it.
   useFormStatus only reports for a form an ancestor of the component that
   calls it, which is why this is not inlined. */
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 w-full bg-accent px-8 py-4 text-label font-semibold text-white transition-[background-color,opacity] duration-500 ease-out hover:bg-white hover:text-ink focus-visible:bg-white focus-visible:text-ink focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:self-end"
    >
      {pending ? "보내는 중" : "보내기"}
    </button>
  );
}

/* The comp has no submit button — three fields and nothing to press. So the
   button is built here, in the page's own language: the one blue on the
   page, inverting to white on hover the way the links do. */
export default function ContactSection() {
  const [state, formAction] = useActionState(sendContact, INITIAL_CONTACT_STATE);

  return (
    <section id="contact" className="relative flex min-h-dvh w-full flex-col bg-veil">
      {/* py-block rather than the comp's 160: with the content centred in a
          full-height section the padding is only a floor, and at 160 the form
          pushed Contact 164px past a screen — one extra half-gesture at the
          very end of the page. Nothing moves on a window with room to
          spare. */}
      <RevealGroup className="mx-auto flex w-full grow flex-col justify-center items-center px-gutter py-block">
        <Reveal as="h2" className="text-display font-bold text-white">
          Contact
        </Reveal>
        <Reveal as="p" delay={BEAT} className="mt-stack text-center text-body font-medium text-white">
          협업, 합류, 의뢰 등 무엇이던지 고민하지 마세요
          <br />
          <span className="text-accent">더모먼트</span>와 함께 순간을 혁신하세요
        </Reveal>

        {/* 600 wide in the comp, centred in a 1280 column. */}
        <form action={formAction} className="mt-block flex w-full max-w-[600px] flex-col gap-stack">
          {FIELDS.map((field, i) => {
            const id = `contact-${field.key}`;
            return (
              <Reveal
                key={field.key}
                delay={beat(i, GROUP)}
                className="flex w-full flex-col gap-2"
              >
                <label htmlFor={id} className="text-label font-medium text-white">
                  {field.label}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    id={id}
                    name={field.key}
                    rows={5}
                    required
                    placeholder={field.placeholder}
                    onInput={(e) => autoGrow(e.currentTarget)}
                    /* overflow-hidden goes with it: the box is always as tall
                       as its content, so there is nothing to scroll, and a
                       bar flickering in on the line that overflows would undo
                       the point of the whole thing. */
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
                    className={fieldClass}
                  />
                )}
              </Reveal>
            );
          })}

          <Reveal delay={beat(FIELDS.length, GROUP)} className="flex flex-col gap-3">
            <SubmitButton />
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
              {state.message || " "}
            </p>
          </Reveal>
        </form>
      </RevealGroup>
    </section>
  );
}
