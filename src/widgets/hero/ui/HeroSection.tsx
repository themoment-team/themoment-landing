import { SITE_HEADING } from "@/shared/config/site";
import ScrollCue from "./ScrollCue";

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
   document, and the logo at the top is the intro's lockup, which docks there
   and stays. Everything this component draws is type.

   Both of the things it does draw wait for the opening to finish. They are
   held by `after-intro`, which reads an attribute the Opening component sets
   on the root — see globals.css. A scroll reveal cannot do it: the reveal
   fires on the element crossing into view, and both of these are in view
   from the first paint, behind the cover. */
export default function HeroSection() {
  return (
    <section className="relative flex min-h-dvh w-full flex-col overflow-hidden">
      {/* The page had no h1 at all — the first heading on it was About's,
          and the name of the thing the page is about was nowhere in its
          text. It could not be: the wordmark is drawn on a canvas out of
          sixteen thousand particles, which is a picture as far as anything
          that is not looking at it is concerned, and there is no alt text on
          a canvas.

          So the heading is stated here and hidden. Hidden, not styled small:
          the design has no title on this screen and should not grow one.
          sr-only leaves it in the accessibility tree and in the markup,
          which is where both audiences that need it are reading. */}
      <h1 className="sr-only">{SITE_HEADING}</h1>

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
        <nav
          aria-label="주요 섹션"
          className="after-intro lg:absolute lg:top-8 lg:left-gutter"
        >
          <ul className="flex items-stretch justify-center gap-2 sm:gap-6">
            {NAV.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  /* py-3 rather than py-2: at 14px the row is 37px tall, and
                     a target under 44 is one a thumb misses. */
                  className="block px-3 py-3 text-label font-medium whitespace-nowrap text-white transition-colors duration-500 ease-out hover:text-accent focus-visible:text-accent focus-visible:outline-none"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* The mark is centred in the artwork behind, so this takes the space
          between the header and the cue and draws nothing. */}
      <div className="grow" />

      {/* Two layers, because two things want this element's opacity: the
          wrapper waits for the opening, and the cue inside fades as the page
          scrolls. Multiplied, rather than one overwriting the other. */}
      <div className="after-intro relative z-10 flex flex-col items-center pb-10">
        <ScrollCue />
      </div>
    </section>
  );
}
