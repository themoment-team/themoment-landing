import Reveal from "@/shared/ui/Reveal";
import { BEAT, beat } from "@/shared/lib/timing";

/* The four the design puts in the corner. Values is deliberately not among
   them — the comp lists About, Member, Work, Contact and nothing else, and
   the values sit inside About's half of the page. */
const NAV = [
  { label: "About", href: "#about" },
  { label: "Member", href: "#member" },
  { label: "Work", href: "#work" },
  { label: "Contact", href: "#contact" },
];

/* The first screen: the navigation in one corner, a cue at the bottom, and
   between them nothing at all.

   That emptiness is the point. Neither of the two things this screen is
   actually made of belongs to it — the mark gathering itself out of a cloud
   of sixteen thousand particles is the field fixed behind the whole
   document, and the logo at the top is the intro's lockup, which docks
   there and stays. Everything this component draws is type. */
export default function HeroSection() {
  return (
    <section className="relative flex min-h-dvh w-full flex-col overflow-hidden">
      {/* No background and no logo of its own.

          The hero used to draw the mark centred at the top, which is exactly
          where the intro's lockup docks — two of them in the same place. The
          intro's is the one that survives: it is fixed rather than in flow,
          so it holds its corner while the page moves under it, and it fades
          out over the first 160px of scroll.

          Which is what the top padding is for. The docked lockup covers
          roughly 31–97px on a desktop and 23–81 on a phone, and being fixed,
          nothing moves out of its way on its own. Below lg the links sit
          centred where the mark is and need the whole clearance; from lg
          they are off in the left gutter and need only the comp's inset.

          The section is also the one place that does not veil the particle
          field — the mark gathering out of the dust is this screen's
          subject, so it runs at full strength here and dimmed after. */}
      <header className="relative z-10 px-gutter pt-[100px] lg:pt-8">
        {/* Centred until there is room for the corner the comp puts them in.
            Absolute rather than a three-column header, so the docked mark
            stays centred on the page rather than on whatever is left beside
            the links.

            lg rather than sm, which is where it was: four links reach about
            370px, the centred mark starts at half the width, and between
            640 and 1024 the two overlap — at 785 the mark lands on top of
            Contact. */}
        <nav aria-label="주요 섹션" className="lg:absolute lg:top-8 lg:left-gutter">
          <ul className="flex items-stretch justify-center gap-2 sm:gap-6">
            {NAV.map((item, i) => (
              <Reveal as="li" key={item.label} variant="reveal-up" delay={beat(i)}>
                <a
                  href={item.href}
                  /* py-3 rather than py-2: at 14px the row is 37px tall, and
                     a target under 44 is one a thumb misses. */
                  className="block px-3 py-3 text-label font-medium whitespace-nowrap text-white transition-colors duration-500 ease-out hover:text-accent focus-visible:text-accent focus-visible:outline-none"
                >
                  {item.label}
                </a>
              </Reveal>
            ))}
          </ul>
        </nav>
      </header>

      {/* The mark is centred in the artwork behind, so this takes the space
          between the header and the cue and draws nothing. */}
      <div className="grow" />

      <Reveal
        delay={beat(NAV.length) + BEAT}
        className="relative z-10 flex flex-col items-center pb-10"
      >
        {/* An anchor rather than a caption: it says there is more below, and
            it is the one thing on this screen a keyboard would want. */}
        <a
          href="#about"
          className="flex flex-col items-center gap-[5px] px-4 py-2 text-label font-medium text-white transition-colors duration-500 ease-out hover:text-accent focus-visible:text-accent focus-visible:outline-none"
        >
          Scroll Down
          <svg
            aria-hidden
            width="11"
            height="7"
            viewBox="0 0 10.7071 6.06066"
            fill="none"
            className="scroll-cue"
          >
            <path d="M0.353553 0.353553L5.35355 5.35355L10.3536 0.353553" stroke="currentColor" />
          </svg>
        </a>
      </Reveal>
    </section>
  );
}
