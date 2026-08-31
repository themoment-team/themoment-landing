"use client";

import { useEffect, useRef } from "react";

/* Gone by the time the reader has taken its advice. It says there is more
   below; once they are below, it is a stale instruction sitting over the
   page. The same 160px the intro's docked logo fades over, so the two things
   pinned to the first screen leave together. */
const FADE_END = 160;

/* Only the scroll fade lives here. The entrance is the Reveal above it, and
   the two multiply — one setting opacity by class, the other inline — which
   is why they are separate elements rather than one fighting itself for the
   same property. */
export default function ScrollCue() {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let ticking = false;

    const apply = () => {
      ticking = false;
      const fade = 1 - Math.min(1, Math.max(0, window.scrollY / FADE_END));
      el.style.opacity = fade.toFixed(3);
      /* Faded out it is still in the layout and still focusable, so a link
         nobody can see would otherwise be a tab stop that scrolls the page
         back up. */
      el.style.pointerEvents = fade < 0.05 ? "none" : "";
      el.setAttribute("aria-hidden", fade < 0.05 ? "true" : "false");
      el.tabIndex = fade < 0.05 ? -1 : 0;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    /* An anchor rather than a caption: it says there is more below, and it is
       the one thing on this screen a keyboard would want. */
    <a
      ref={ref}
      href="#about"
      className="flex flex-col items-center gap-[5px] px-4 py-2 text-label font-medium text-white transition-colors duration-500 ease-out hover:text-accent focus-visible:text-accent focus-visible:outline-none"
    >
      Scroll Down
      <svg aria-hidden width="11" height="7" viewBox="0 0 10.7071 6.06066" fill="none" className="scroll-cue">
        <path d="M0.353553 0.353553L5.35355 5.35355L10.3536 0.353553" stroke="currentColor" />
      </svg>
    </a>
  );
}
