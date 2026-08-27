import { useEffect, useState } from "react";
import DotField from "./DotField";
import Reveal from "./Reveal";
import Wordmark from "./Wordmark";
import useInView from "../hooks/useInView";
import { BEAT, HERO } from "../lib/timing";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Contact", href: "#contact" },
];

/* The hero opens on one cue:

     mark    the M is painted while the wordmark gathers out of its facets
     nav     the links arrive
     invert  the band turns from paper to ink

   and the band alone carries a second beat — dots up on the dark once it has
   turned, so the field reads as appearing on a background that inverted
   rather than as arriving with it.

   All of it used to be a chain, the band waiting for the mark to settle
   before it even began, which left the opening still going a second and a
   half after the wordmark had landed.

   The band is a block of its own between the navigation and the mark, rather
   than the section's background. Ink and paper no longer trade places across
   the whole hero, so the navigation and the wordmark stay dark on white
   throughout and the dark is a field they sit above and below — not
   something they are inside.

   Lengths live in lib/timing.js and are asked of the components that own
   them, so retiming the wordmark moves everything measured against it.

   The hero holds the full viewport so nothing below it shows on first paint,
   and the band takes what the navigation and the mark leave. Both keep clear
   of it: with the band running edge to edge against them the links looked
   pinned to the dark and the mark looked stuck to its underside. The gaps
   come out of the band's own height rather than out of the section's, so the
   mark stays on the first screen's bottom edge whatever they are set to.

   The wordmark keeps its own 1440:159 ratio rather than a percentage of the
   hero height — tying it to the height would stretch the letterforms as the
   viewport gets taller. Everything around it is expressed as a percentage of
   width, which is what padding percentages resolve against, so the whole
   group scales as one no matter how tall the screen is; pb-[2.19%] is the
   Figma gap below the mark re-based onto the wordmark box.

   The whole opening plays once. Everything else on the page rearms when it
   leaves the screen, but this is the page introducing itself — replaying it
   on the way back up would read as the site restarting. So the hero, its
   navigation and the band all take `once` and the observer stops watching
   after the first pass. */

export default function Hero() {
  const [ref, inView] = useInView({ threshold: 0, rootMargin: "0px" });
  const [inverted, setInverted] = useState(false);
  const [dots, setDots] = useState(false);

  useEffect(() => {
    if (!inView) return undefined;
    const a = setTimeout(() => setInverted(true), HERO.invert);
    const b = setTimeout(() => setDots(true), HERO.dots);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [inView]);

  return (
    <section
      ref={ref}
      className="hero relative w-full min-h-dvh flex flex-col overflow-hidden bg-white"
    >
      {/* A list inside the landmark, so the links are announced as three of
          a set rather than as three loose links in a row.

          Every box is the same width: the row is bounded and each item takes
          an equal share of it, so the hit targets are identical whatever the
          labels say. Laid out on the gap between labels instead, the longest
          label got a target half again the size of the shortest, the spacing
          shifted whenever a label changed, and nothing lined up down the row.
          The padding is what makes each one a box worth hitting rather than
          five characters of text.

          The bound is sized for the count, and kept tight: three items
          dividing the width four were sharing would have given each a 175px
          box, and even the first bound after that left the row reading as
          three widely spaced words rather than as one control. */}
      <nav className="relative shrink-0 flex justify-center pt-5">
        <ul className="flex items-stretch w-full max-w-[clamp(210px,24vw,330px)]">
          {NAV_LINKS.map((link, i) => (
            <Reveal
              as="li"
              key={link.label}
              /* The hero is the one place that still travels; everything
                 below it fades. */
              variant="reveal-up"
              delay={HERO.nav + i * BEAT}
              className="flex-1 min-w-0"
            >
              <a
                href={link.href}
                className="block w-full text-center px-2 py-2 text-[#292b2f] text-[clamp(14px,1.5vw,20px)] font-light whitespace-nowrap transition-colors duration-500 ease-out hover:text-[#4A80F8]"
              >
                {link.label}
              </a>
            </Reveal>
          ))}
        </ul>
      </nav>

      {/* Margins rather than padding on the neighbours: the band is the thing
          being held off them, and it is the one flex item that gives, so the
          gaps come out of its height and the mark does not move.

          Tight, and tighter above than below: the mark is 137px of solid ink
          and wants more clearance than a row of small links does. */}
      <div
        /* The space before the interpolation is load-bearing: Tailwind scans
           this file as text, and a utility butted straight against `${` is
           read as part of the same token and never generated. mb-stack
           silently resolved to no margin at all. */
        className={`hero-band relative grow mt-4 mb-stack ${
          inverted ? "is-on" : ""
        }`}
      >
        <DotField on={dots} />
      </div>

      <div className="relative shrink-0 w-full pb-[2.19%]">
        {/* The page's one h1. The mark is artwork and stays artwork — the
            heading takes its accessible name from the svg's own aria-label,
            so a screen reader hears THE MOMENT where a browser draws it, and
            the document finally has a heading over the two it already had
            further down. Tailwind's reset leaves h1 with no size or margin of
            its own, so this is the same box it was. */}
        <h1 className="relative w-full aspect-[1440/159]">
          <Wordmark delay={HERO.mark} />
        </h1>
      </div>
    </section>
  );
}
