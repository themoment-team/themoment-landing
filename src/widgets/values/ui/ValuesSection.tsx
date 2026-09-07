"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "@/shared/ui/Reveal";
import RevealGroup from "@/shared/ui/RevealGroup";
import { GROUP, beat } from "@/shared/lib/timing";

/* Each value carries the sentence that belongs to it. The comp shows one
   sentence and one lit row, which is a single frame of something that moves:
   the reader scrolls, the lit row advances, and the sentence at the top
   changes with it. */
const VALUES = [
  {
    num: "01.",
    name: "Professional",
    line: "각자의 분야에서 끊임없이 배우고 성장하며, 역량을 키웁니다.",
  },
  {
    num: "02.",
    name: "Communication",
    line: "열린 태도와 신뢰를 바탕으로, 서로를 존중하며 함께 나아갑니다.",
  },
  {
    num: "03.",
    name: "Passion",
    line: "창의적인 사고와 혁신에 앞장서고, 변화와 이견을 두려워하지 않습니다.",
  },
];

export default function ValuesSection() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  /* Which value is showing is a function of how far into the section the page
     has scrolled — not of the pointer, which is what used to drive it. The
     section is several screens tall and its content is stuck to the top of
     the screen for all of them, so the scroll happens against a still picture
     and only the value changes. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let ticking = false;

    const update = () => {
      ticking = false;
      /* How far the pinned child has to travel: the section's height less
         the one screen it is pinned to. */
      const range = el.offsetHeight - window.innerHeight;
      if (range <= 0) return;
      const progress = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / range));
      /* One equal band of the travel each — a third of it apiece, so no
         value is read for longer than another.

         Rounding to the nearest of three points instead, which is what this
         did, only gives the middle value a full band: the first and last sit
         either side of it with half a band each, and Passion went by in half
         the scrolling Communication got. */
      setActive(Math.min(VALUES.length - 1, Math.floor(progress * VALUES.length)));
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      ref={ref}
      id="values"
      className="relative w-full bg-white"
      /* One screen of scrolling per value, written from the list rather than
         as a class so adding a fourth value cannot silently leave it without
         room to appear in. Tailwind compiles class names ahead of time and
         could not have done this. */
      style={{ minHeight: `${VALUES.length * 100}dvh` }}
    >
      {/* Pinned for the whole of that scroll. The comp pins the sentence to
          the top of the frame and hangs the list off the bottom, which is
          what justify-between reproduces once the child is exactly a screen
          tall. */}
      <RevealGroup className="sticky top-0 mx-auto flex h-dvh w-full flex-col justify-between px-gutter py-section">
        {/* One sentence split across the width, the way the comp sets it —
            the subject on the left, the rest hard against the right margin.
            The left half never changes; the right half is whichever value is
            being read. */}
        <Reveal
          as="div"
          className="flex flex-col justify-between gap-2 text-statement font-bold text-graphite lg:flex-row lg:gap-stack"
        >
          <span className="shrink-0">
            저희는 <span className="text-accent">좋은 서비스</span>를 위해
          </span>

          {/* All three sentences share one grid cell, so the box is as tall as
              the longest of them and nothing moves as they change. Swapping
              the text of a single node instead would cut straight from one
              sentence to the next with no crossfade, and would reflow the row
              whenever two of them wrapped to different heights. */}
          <span className="grid lg:justify-items-end lg:text-right">
            {VALUES.map((value, i) => (
              <span
                key={value.num}
                aria-hidden={i !== active}
                className={`col-start-1 row-start-1 transition-opacity duration-500 ease-out ${
                  i === active ? "opacity-100" : "opacity-0"
                }`}
              >
                {value.line}
              </span>
            ))}
          </span>
        </Reveal>

        <ul className="flex flex-col gap-stack">
          {VALUES.map((value, i) => {
            const isActive = active === i;
            return (
              <Reveal as="li" key={value.num} delay={beat(i, GROUP)} className="w-full">
                {/* Nothing to press. The list reports which value is being
                    read; it is not a control. It used to be focusable and
                    pointer-driven, which fought the scroll for the same piece
                    of state. */}
                <div className="flex items-baseline gap-6 sm:gap-12">
                  <span
                    className={`w-[38px] shrink-0 text-numeral font-medium transition-colors duration-500 ease-out ${
                      /* On white the dimmed blue reads darker than the type
                         it is meant to sit behind, so the off state is the
                         same faint grey the name takes. */
                      isActive ? "text-accent" : "text-faint"
                    }`}
                  >
                    {value.num}
                  </span>
                  <p
                    className={`text-headline font-semibold transition-colors duration-500 ease-out ${
                      isActive ? "text-graphite" : "text-faint"
                    }`}
                  >
                    {value.name}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </RevealGroup>
    </section>
  );
}
