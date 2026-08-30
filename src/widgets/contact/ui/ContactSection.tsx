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
    <section id="contact" className="relative flex min-h-dvh w-full flex-col bg-veil scroll-mt-16">
      <RevealGroup className="mx-auto flex w-full max-w-column grow flex-col justify-center items-center px-gutter py-section">
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
                    className={`${fieldClass} min-h-[120px] resize-y`}
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
