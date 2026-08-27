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

export default function Contact() {
  const [values, setValues] = useState(EMPTY);
  const [status, setStatus] = useState("idle");

  const handleChange = (key) => (e) => {
    setValues((prev) => ({ ...prev, [key]: e.target.value }));
    if (status !== "idle") setStatus("idle");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("sent");
    setValues(EMPTY);
  };

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
              className="bg-[#292b2f] text-white font-bold text-body px-8 py-4 transition-colors duration-500 ease-out hover:bg-[#4A80F8] focus-visible:bg-[#4A80F8] outline-none"
            >
              Send
            </button>
            <p
              role="status"
              aria-live="polite"
              className={`font-semibold text-caption text-[#4A80F8] transition-opacity duration-500 ease-out ${
                status === "sent" ? "opacity-100" : "opacity-0"
              }`}
            >
              문의가 접수되었습니다.
            </p>
          </Reveal>
        </form>
      </RevealGroup>
    </section>
  );
}
