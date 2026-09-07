import Reveal from "@/shared/ui/Reveal";
import RevealGroup from "@/shared/ui/RevealGroup";
import { BEAT } from "@/shared/lib/timing";

/* Who the team is, in two lines and centred. The shortest section on the
   page and the only one that is nothing but prose. */
export default function AboutSection() {
  return (
    <section id="about" className="relative flex min-h-dvh w-full flex-col bg-veil">
      <RevealGroup className="mx-auto flex w-full grow flex-col justify-center items-center px-gutter py-block text-center">
        <Reveal as="h2" className="text-display font-bold text-white">
          About
        </Reveal>

        {/* Centred is the comp, and it is right for one or two lines on a
            wide screen. On a phone the same paragraph is three or four, and
            a centred block that long gives the eye a different starting
            point on every line — so it is centred only from sm up. The
            measure keeps it from running the whole width of a laptop. */}
        <Reveal
          as="p"
          delay={BEAT}
          className="mx-auto mt-stack max-w-measure text-left text-body font-medium text-white sm:text-center"
        >
          <span className="text-accent">더모먼트</span>는 광주소프트웨어마이스터고의 전공동아리입니다.
          {/* The comp breaks here and the break is the design — one clause a
              line. A soft break rather than two paragraphs, so a narrow
              screen is free to rewrap instead of holding a line chosen for
              a 1440 canvas. */}
          <br className="hidden sm:inline" />{" "}
          항상 새로운 비즈니스 모델에 대해 고민하고, 기술을 통해 사용자의 경험을 향상시키려 노력합니다.
        </Reveal>
      </RevealGroup>
    </section>
  );
}
