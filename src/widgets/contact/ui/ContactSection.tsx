import Reveal from "@/shared/ui/Reveal";
import RevealGroup from "@/shared/ui/RevealGroup";
import { BEAT } from "@/shared/lib/timing";
import ContactForm from "./ContactForm";

/* The heading and the copy are server-rendered; only the form below them
   hydrates.

   The section exists to read one environment variable. Web3Forms refuses
   server-side callers — see api/sendContact — so the send has to happen in
   the browser, and the key has to get there. Read here rather than named
   NEXT_PUBLIC_ and reached for in the client component, because that keeps
   it one variable, set one way, in one place: the same WEB3FORMS_ACCESS_KEY
   already in Vercel, with nothing to add.

   It is inlined at build, so a new key needs a redeploy to take. */
export default function ContactSection() {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY ?? null;

  return (
    <section id="contact" className="relative flex min-h-dvh w-full flex-col bg-veil">
      <RevealGroup className="mx-auto flex w-full grow flex-col justify-center items-center px-gutter py-roomy">
        <Reveal as="h2" className="text-display font-bold text-white">
          Contact
        </Reveal>
        <Reveal as="p" delay={BEAT} className="mt-stack text-center text-body font-medium text-white">
          협업, 합류, 의뢰 등 무엇이던지 고민하지 마세요
          <br />
          <span className="text-accent">더모먼트</span>와 함께 순간을 혁신하세요
        </Reveal>

        <ContactForm accessKey={accessKey} />
      </RevealGroup>
    </section>
  );
}
