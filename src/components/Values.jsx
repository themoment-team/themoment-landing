import Reveal from "./Reveal";
import RevealGroup from "./RevealGroup";
import { GROUP, beat } from "../lib/timing";

const VALUES = [
  {
    num: "1.",
    tag: "Professional",
    title:
      "We are the experts who lead our field — driven by relentless learning, sharpening our craft, and raising the standard of what's possible.",
    sub: "끊임없이 배우고 역량을 키우며, 각자의 분야에서 최고가 되는 사람들.",
  },
  {
    num: "2.",
    tag: "Communication",
    title:
      "We are collaborators who move as one — grounded in openness and trust, we respect one another and grow together.",
    sub: "열린 태도와 신뢰를 바탕으로, 서로를 존중하며 함께 나아가는 사람들.",
  },
  {
    num: "3.",
    tag: "Passion",
    title:
      "We are challengers who thrive on ambition — with creative thinking, we embrace change and never fear failure.",
    sub: "창의적인 사고로 변화에 앞장서고, 실패를 두려워하지 않는 열정적인 사람들.",
  },
];

export default function Values() {
  return (
    <section
      id="service"
      className="relative bg-white w-full overflow-hidden"
    >
      <RevealGroup className="relative px-gutter py-section">
        {/* The one section that opened straight into its content. Every
            other one is announced — 더모먼트, Our Project, Contact Us — so
            this read as three rows that had come loose from whatever they
            belonged to, and the document outline had a section in it with no
            name at all. Same treatment as Our Project, down to the brand
            blue on the second word. */}
        <Reveal
          as="h2"
          className="font-bold text-[#292b2f] text-display mb-block"
        >
          Our <span className="text-[#4A80F8]">Value</span>
        </Reveal>

        <div className="flex flex-col gap-block">
          {/* One cue for all three rows, so they need their own offset —
              without it the rows are identical delays and arrive in perfect
              unison, which reads as a switch rather than a run. */}
          {VALUES.map((v, i) => (
            <div
              key={v.num}
              className="w-full flex flex-col lg:flex-row items-start justify-between gap-stack"
            >
              <Reveal
                as="p"
                delay={beat(0, i * GROUP)}
                className="font-bold text-[#4A80F8] text-lead shrink-0"
              >
                {v.tag}
              </Reveal>
              <div className="flex gap-stack items-start w-full lg:w-auto">
                <Reveal
                  as="p"
                  delay={beat(1, i * GROUP)}
                  className="font-bold text-[#e9e9e9] text-title shrink-0"
                >
                  {v.num}
                </Reveal>
                <div className="flex flex-col gap-stack min-w-0">
                  <Reveal
                    as="p"
                    delay={beat(2, i * GROUP)}
                    className="font-bold text-[#292b2f] text-lead max-w-[688px]"
                  >
                    {v.title}
                  </Reveal>
                  <Reveal
                    as="p"
                    delay={beat(3, i * GROUP)}
                    className="font-semibold text-[#555962] text-body"
                  >
                    {v.sub}
                  </Reveal>
                </div>
              </div>
            </div>
          ))}
        </div>
      </RevealGroup>
    </section>
  );
}
