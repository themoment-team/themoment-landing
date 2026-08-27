import Reveal from "./Reveal";
import { GROUP, beat } from "../lib/timing";

/* The team's own accounts, as published on its GitHub organisation. This
   column was two identical Instagram entries pointing at "#", which is a
   link that scrolls the visitor back to the top of the page and opens a
   blank tab doing it. */
const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/team.the_moment/" },
  { label: "GitHub", href: "https://github.com/themoment-team" },
];

/* No href, so it is not a link. There is no privacy policy to point at yet,
   and a label that goes nowhere is worse than a label that admits it is only
   a label — give it a href when the page exists and it becomes one. */
const LEGAL_LINKS = [{ label: "Privacy Policy", href: null }];

/* Ink on the blue field — hovering to the brand colour would be invisible
   here, since the brand colour is the background. */
const linkClass =
  "font-bold text-white text-label transition-colors duration-500 ease-out hover:text-[#292b2f]";

/* The same type, without the promise of going anywhere. */
const deadClass = "font-bold text-[#cfdcff] text-label";

/* Split into two colour fields rather than one flat band: the identity sits
   in ink, the navigation in the brand blue, and the seam between them runs
   the height of the footer. */
export default function Footer() {
  return (
    <footer className="relative w-full flex flex-col lg:flex-row">
      <div className="flex-1 bg-[#292b2f] px-gutter py-section">
        <Reveal as="p" className="font-bold text-white text-title">
          THE MOMENT
        </Reveal>
        <Reveal
          as="p"
          delay={beat(1)}
          className="font-bold text-[#9aa0ab] text-subtitle mt-4"
        >
          A development partner innovating the moment.
        </Reveal>
        <Reveal
          as="p"
          delay={beat(2)}
          className="font-normal text-[#767c87] text-caption mt-block"
        >
          © 2026 the_moment. All rights reserved.
        </Reveal>
      </div>

      <Reveal
        delay={GROUP}
        className="lg:w-[38%] bg-[#4A80F8] px-gutter py-section flex gap-block"
      >
        <div className="flex flex-col gap-stack">
          <Reveal
            as="p"
            className="font-normal text-[#cfdcff] text-caption"
          >
            SOCIAL
          </Reveal>
          <div className="flex flex-col gap-stack">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                /* These leave the site, and a new tab arriving unannounced
                   is disorienting for anyone who cannot see it happen. */
                aria-label={`${link.label} (새 창에서 열립니다)`}
                className={linkClass}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-stack">
          <Reveal
            as="p"
            className="font-normal text-[#cfdcff] text-caption"
          >
            LEGAL
          </Reveal>
          <div className="flex flex-col gap-stack">
            {LEGAL_LINKS.map((link) =>
              link.href ? (
                <a key={link.label} href={link.href} className={linkClass}>
                  {link.label}
                </a>
              ) : (
                <p key={link.label} className={deadClass}>
                  {link.label}
                </p>
              ),
            )}
          </div>
        </div>
      </Reveal>
    </footer>
  );
}
