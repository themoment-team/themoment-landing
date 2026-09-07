"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/* Tile 160 plus the 12 between them. Three at a time is a press that moves
   the rail visibly without throwing away where the reader was. */
const STRIDE = 172 * 3;

interface RailState {
  overflow: boolean;
  start: boolean;
  end: boolean;
  /* Both 0–1: the share of the row that fits on screen, and where that
     share starts. Together they are the gauge under the rail. */
  ratio: number;
  offset: number;
}

/* One part's members, on one line that scrolls sideways.

   The rail runs full width — out past the page's gutter to the screen edge
   on both sides — so a row that continues looks like it continues rather
   than like it stops at a margin. What is off the end is signalled by fading
   the edge it runs off, and only that edge: at the start of the rail there
   is nothing to the left, so the left fade is not drawn.

   Fifteen people in Server and two in Design. The two-person rails get none
   of this: no fade, no arrows, nothing to press. Whether the rail overflows
   is measured, not assumed, so nobody has to remember to keep a threshold in
   step with the roster. */
export default function MemberRail({ label, children }: { label: string; children: ReactNode }) {
  const scroller = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const [rail, setRail] = useState<RailState>({
    overflow: false,
    start: true,
    end: true,
    ratio: 1,
    offset: 0,
  });

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;

    let frame = 0;

    const measure = () => {
      frame = 0;
      const max = el.scrollWidth - el.clientWidth;
      const next: RailState = {
        /* A pixel of slack: sub-pixel layout leaves scrollWidth a hair over
           clientWidth on rows that do not actually overflow. */
        overflow: max > 1,
        start: el.scrollLeft <= 1,
        end: el.scrollLeft >= max - 1,
        /* The gauge, as two fractions of the whole row: how much of it is
           on screen, and how far in the visible part starts. Taken against
           scrollWidth rather than against max, so the two add up to exactly
           1 when the rail is scrolled to the end and the bar finishes flush
           with its track. */
        ratio: el.scrollWidth > 0 ? el.clientWidth / el.scrollWidth : 1,
        offset: el.scrollWidth > 0 ? el.scrollLeft / el.scrollWidth : 0,
      };
      /* Handing back the state that is already there is how React is told
         there is nothing to do. A fresh object every time is not: a rail
         that has been scrolled to its end and is being pushed against, or
         an observer firing on a layout that did not move, would re-render
         the whole row for a set of identical numbers. */
      setRail((prev) =>
        prev.overflow === next.overflow &&
        prev.start === next.start &&
        prev.end === next.end &&
        prev.ratio === next.ratio &&
        prev.offset === next.offset
          ? prev
          : next,
      );
    };

    /* Scroll events arrive faster than the screen is redrawn — a trackpad
       flick on a fifteen-person rail fires several per frame, and each one
       was a measurement and a render for a gauge that is only ever seen
       once per frame. */
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    el.addEventListener("scroll", schedule, { passive: true });

    /* Two things are watched, and they answer different questions.

       The scroller says how much room there is: it changes when the window
       does. The track says how much there is to show: it changes when
       Pretendard arrives from the CDN after the first paint and every name
       reflows, and again as avatars decode. Watching only the scroller —
       which is what the rail measures against — would have this rail decide
       it does not overflow while it is still laid out in the fallback font.
       The tab underline on this same section was already caught by exactly
       that. */
    const observer = new ResizeObserver(schedule);
    observer.observe(el);
    if (track.current) observer.observe(track.current);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      el.removeEventListener("scroll", schedule);
      observer.disconnect();
    };
  }, []);

  const nudge = (direction: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    /* CSS scroll-behavior does not reach a scrollBy that asks for smooth by
       name, so the preference is read here instead. */
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: direction * Math.min(STRIDE, el.clientWidth),
      behavior: still ? "auto" : "smooth",
    });
  };

  return (
    <div className="w-full">
      {/* The row above the rail holds the arrows and nothing else — the tabs
          already say which part this is. It is drawn whether or not there
          are arrows in it, so that switching from Server to Design does not
          move the rail up by the height of a button it no longer has. */}
      <div className="mb-stack flex min-h-7 items-center justify-end">
        {rail.overflow ? (
          /* Mouse-only, and out of the accessibility tree on purpose: the
             scroller itself takes focus and every tile in it is reachable by
             Tab, so these two are a duplicate route rather than the only
             one. tabIndex -1 goes with the aria-hidden — a hidden control
             that can still be focused is a trap, not a shortcut. */
          <div aria-hidden className="member-rail-nav gap-2">
            {([-1, 1] as const).map((direction) => (
              <button
                key={direction}
                type="button"
                tabIndex={-1}
                onClick={() => nudge(direction)}
                disabled={direction === -1 ? rail.start : rail.end}
                className="grid size-7 place-items-center rounded-full border border-line text-white transition-colors duration-300 ease-out hover:border-accent hover:text-accent disabled:cursor-default disabled:border-line disabled:text-muted disabled:opacity-40"
              >
                <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                  <path
                    d={direction === -1 ? "M6 1L1 6l5 5" : "M1 1l5 5-5 5"}
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* The gutter is given back as padding after being taken off as
          margin, so the line starts where the heading does and still runs to
          the screen edge. scroll-px keeps a tile that was reached by Tab
          from stopping under the fade. */}
      <div
        ref={scroller}
        tabIndex={0}
        role="group"
        aria-label={label}
        data-overflow={rail.overflow}
        data-start={rail.start}
        data-end={rail.end}
        className="member-rail -mx-gutter px-gutter scroll-px-gutter focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        {/* w-max is the whole trick: without it the tiles shrink to fit the
            container and there is nothing to scroll. */}
        <ul ref={track} className="flex w-max gap-3">
          {children}
        </ul>
      </div>

      {/* The gauge. The rail's own scrollbar is hidden — four of them under
          four tabs is a lot of chrome for one row — so this says the same
          thing in the page's own language: a hairline the width of the
          content, and a lit part as wide as the share of the row that is on
          screen.

          It is drawn whether or not there is anything to scroll, and only
          faded out when there is not, so that switching from Server to
          Design does not shorten the section by the height of a bar. Not a
          control: the row above is the thing that scrolls, and this reports
          on it. */}
      <div
        aria-hidden
        className={`mt-stack h-0.5 w-full bg-line transition-opacity duration-300 ease-out ${
          rail.overflow ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Margin in per cent resolves against the track's width, which is
            what puts the lit part where the visible tiles are. No transition
            on either number — they are updated from the scroll event, and
            easing them would make the bar lag the row it is reporting on. */}
        <div
          className="h-full bg-white"
          style={{ width: `${rail.ratio * 100}%`, marginLeft: `${rail.offset * 100}%` }}
        />
      </div>
    </div>
  );
}
