"use client";

import { useState } from "react";
import Reveal from "@/shared/ui/Reveal";
import RevealGroup from "@/shared/ui/RevealGroup";
import { GROUP, beat } from "@/shared/lib/timing";

/* The comp draws this list with the first row lit and the other two dimmed,
   which is a state rather than a style — three rows permanently greyed out
   would read as two of the team's three values being switched off. So the
   lit row follows the pointer, and starts where the comp has it. */
const VALUES = [
  {
    num: "01.",
    name: "Professional",
    note: "각자의 분야에서 최고가 되기 위해 끊임없이 학습하고 역량을 키웁니다.",
  },
  {
    num: "02.",
    name: "Communication",
    note: "열린 태도와 신뢰를 바탕으로, 서로를 존중하며 함께 나아갑니다.",
  },
  {
    num: "03.",
    name: "Passion",
    note: "창의적인 사고로 변화에 앞장서고, 실패를 두려워하지 않습니다.",
  },
];

export default function ValuesSection() {
  const [active, setActive] = useState(0);

  return (
    <section id="values" className="relative flex min-h-dvh w-full flex-col bg-veil scroll-mt-16">
      {/* The one section that does not centre its content. The comp pins the
          sentence to the top of an 810-tall frame and hangs the list off the
          bottom, which only became reproducible once the section was a whole
          screen — before that it was a guessed gap in the middle. */}
      <RevealGroup className="mx-auto flex w-full max-w-column grow flex-col justify-between px-gutter py-section">
        {/* One sentence split across the width, the way the comp sets it —
            the subject on the left, the rest hard against the right margin.
            It stays one paragraph, so a screen reader hears one sentence
            rather than two fragments. */}
        <Reveal
          as="p"
          className="flex flex-col justify-between gap-2 text-statement font-bold text-white lg:flex-row lg:gap-stack"
        >
          <span className="shrink-0">
            저희는 <span className="text-accent">좋은 서비스</span>를 위해
          </span>
          <span className="lg:text-right">
            각자의 분야에서 최고가 되기 위해 끊임없이 학습하고 역량을 키웁니다.
          </span>
        </Reveal>

        {/* The gap above this is whatever the screen leaves, which is what
            justify-between on the group is for. It used to be a fixed
            max(4rem, 16vh) standing in for the height of a frame the section
            did not have. The floor is only there so the two blocks do not
            touch on a short screen. */}
        <ul className="mt-block flex flex-col gap-stack">
          {VALUES.map((value, i) => {
            const isActive = active === i;
            return (
              <Reveal as="li" key={value.num} delay={beat(i, GROUP)} className="w-full">
                {/* Pointer and keyboard both light a row. A group rather
                    than a button: nothing happens when you press it, it only
                    says which value is being read. */}
                <div
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  tabIndex={0}
                  className="flex flex-col gap-1 outline-none sm:flex-row sm:items-baseline sm:gap-12"
                >
                  <span
                    className={`w-[38px] shrink-0 text-numeral font-medium transition-colors duration-500 ease-out ${
                      isActive ? "text-accent" : "text-accent-dim"
                    }`}
                  >
                    {value.num}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={`text-headline font-semibold transition-colors duration-500 ease-out ${
                        isActive ? "text-white" : "text-muted"
                      }`}
                    >
                      {value.name}
                    </p>
                    {/* What the value actually means. The comp has room for
                        three names and nothing else, and a reader who does
                        not already know the team learns nothing from the
                        word Passion on its own. It is set only while the row
                        is the one being read, so the list still reads as
                        three words at rest. */}
                    <p
                      className={`overflow-hidden text-body font-medium text-muted transition-all duration-500 ease-out ${
                        isActive ? "mt-2 max-h-24 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      {value.note}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </RevealGroup>
    </section>
  );
}
