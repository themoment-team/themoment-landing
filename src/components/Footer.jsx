import Reveal from "./Reveal";
import { GROUP, beat } from "../lib/timing";

const SOCIAL_LINKS = [
  { label: "Instagram", href: "#" },
  { label: "Instagram", href: "#" },
];

const LEGAL_LINKS = [{ label: "Privacy Policy", href: "#" }];

/* Ink on the blue field — hovering to the brand colour would be invisible
   here, since the brand colour is the background. */
const linkClass =
  "font-bold text-white text-label transition-colors duration-500 ease-out hover:text-[#292b2f]";

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
            {SOCIAL_LINKS.map((link, i) => (
              <a
                key={i}
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
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
            {LEGAL_LINKS.map((link) => (
              <a key={link.label} href={link.href} className={linkClass}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </Reveal>
    </footer>
  );
}
