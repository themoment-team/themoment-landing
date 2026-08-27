import { useState } from "react";
import Reveal from "./Reveal";
import RevealGroup from "./RevealGroup";
import { BEAT, GROUP, beat } from "../lib/timing";

const FIELDS = [
  { key: "name", type: "text", title: "TITLE", sub: "SUBEXPLAIN" },
  { key: "email", type: "email", title: "TITLE", sub: "SUBEXPLAIN" },
  { key: "message", type: "textarea", title: "TITLE", sub: "SUBEXPLAIN" },
];

const EMPTY = { name: "", email: "", message: "" };

/* Where a message actually goes. The form used to say 문의가 접수되었습니다
   and post nothing anywhere — it cleared its own fields and told the visitor
   their message had been received, which is the one thing a contact form
   must not get wrong.

   It takes any endpoint that accepts a JSON POST: a Formspree form, a Vercel
   function, an Apps Script. Set VITE_CONTACT_ENDPOINT in .env — see
   .env.example — and rebuild. With nothing set the form says so rather than
   pretending, which is also how the team finds out it is unwired. */
const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT;

/* idle, sending, sent, error — the last three each have a line to say. */
const MESSAGE = {
  sending: "보내는 중입니다…",
  sent: "문의가 접수되었습니다.",
  error: "전송에 실패했습니다. 잠시 후 다시 시도해 주세요.",
  unwired: "문의 폼은 연결 준비 중입니다.",
};

export default function Contact() {
  const [values, setValues] = useState(EMPTY);
  const [status, setStatus] = useState("idle");

  const handleChange = (key) => (e) => {
    setValues((prev) => ({ ...prev, [key]: e.target.value }));
    if (status !== "idle") setStatus("idle");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ENDPOINT || status === "sending") return;

    setStatus("sending");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(values),
      });
      /* Anything but a 2xx is a failure the visitor has to be told about,
         including the ones a form service answers with a body. */
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
      setValues(EMPTY);
    } catch {
      setStatus("error");
    }
  };

  const note = ENDPOINT ? MESSAGE[status] : MESSAGE.unwired;
  const busy = status === "sending";

  const inputClass =
    "bg-[#f5f5f5] w-full px-4 py-3 font-bold text-[#292b2f] text-body outline-none " +
    "border border-transparent transition-colors duration-500 ease-out " +
    "focus:border-[#4A80F8] focus:bg-white placeholder:text-[#292b2f] placeholder:opacity-40";

  return (
    <section id="contact" className="relative bg-white w-full overflow-hidden">
      {/* Stacked and left aligned, the way every other section reads. It was
          two columns centred against each other, which put the short heading
          in the middle of the tall form's height — so the section opened on
          259px of nothing above the heading, and the join above it came out
          at twice the page's other seams. */}
      <RevealGroup className="relative px-gutter py-section flex flex-col items-start gap-block">
        <Reveal as="h2" className="font-bold text-[#292b2f] text-display">
          Contact <span className="text-[#4A80F8]">Us</span>
        </Reveal>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[660px] flex flex-col gap-stack"
        >
          {FIELDS.map((field, i) => {
            const id = `contact-${field.key}`;
            return (
              <Reveal
                key={field.key}
                delay={beat(i, GROUP)}
                className="flex flex-col gap-2 w-full"
              >
                <Reveal
                  as="label"
                  htmlFor={id}
                  delay={beat(i, GROUP)}
                  className="font-bold text-[#292b2f] text-label"
                >
                  {field.title}
                </Reveal>
                <Reveal
                  as="p"
                  delay={beat(i, GROUP) + BEAT}
                  className="font-normal text-[#555962] text-caption"
                >
                  {field.sub}
                </Reveal>
                {field.type === "textarea" ? (
                  <textarea
                    id={id}
                    name={field.key}
                    rows={5}
                    required
                    value={values[field.key]}
                    onChange={handleChange(field.key)}
                    placeholder="Form"
                    className={`${inputClass} resize-y`}
                  />
                ) : (
                  <input
                    id={id}
                    name={field.key}
                    type={field.type}
                    required
                    value={values[field.key]}
                    onChange={handleChange(field.key)}
                    placeholder="Form"
                    className={inputClass}
                  />
                )}
              </Reveal>
            );
          })}

          <Reveal delay={beat(3, GROUP)} className="flex items-center gap-4">
            <button
              type="submit"
              disabled={!ENDPOINT || busy}
              className="bg-[#292b2f] text-white font-bold text-body px-8 py-4 transition-colors duration-500 ease-out hover:bg-[#4A80F8] focus-visible:bg-[#4A80F8] outline-none disabled:bg-[#9aa0ab] disabled:cursor-not-allowed disabled:hover:bg-[#9aa0ab]"
            >
              {busy ? "Sending" : "Send"}
            </button>
            {/* One line for every outcome, held in the live region the whole
                time rather than mounted when there is news — a region that
                arrives with its text already in it is a region screen readers
                may not announce. Failures are set in ink rather than in the
                brand blue, so success and failure do not read alike at a
                glance; the words carry it either way, for anyone who cannot
                tell the two colours apart. */}
            <p
              role="status"
              aria-live="polite"
              className={`font-semibold text-caption transition-opacity duration-500 ease-out ${
                status === "error" || !ENDPOINT
                  ? "text-[#292b2f]"
                  : "text-[#4A80F8]"
              } ${note ? "opacity-100" : "opacity-0"}`}
            >
              {note}
            </p>
          </Reveal>
        </form>
      </RevealGroup>
    </section>
  );
}
