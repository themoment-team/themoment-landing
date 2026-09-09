"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/* Three tiles at a time is a press that moves the rail visibly without
   throwing away where the reader was. The tile's width is measured rather
   than written down: it is 136, 160, 208 or 240 depending on the viewport,
   and a constant here would be a fourth place to remember that. */
const TILES_PER_PRESS = 3;

/* How long a smooth scroll is given to finish, in ms. Only used to decide
   whether the rail is still gliding somewhere — the browser owns the real
   duration and does not report it. */
const GLIDE = 300;

/* The gap in wheel events that ends a gesture, in ms. A wheel has no
   equivalent of a finger lifting, so the only thing that says one push is
   over is that the notches stopped coming. Long enough to hold across the
   gaps inside one push — a mouse notch train runs about 50ms apart, a
   trackpad's faster — and short enough that stopping and pushing again is
   read as a second push rather than the same one. */
const IDLE = 200;

/* How long the rail keeps the page still after it last moved, in ms.

   A wheel is not pushed once and held: it is flicked, and a reader working
   along a rail flicks it several times with a beat between them. Those beats
   are longer than IDLE, so each flick is a new push — and the flick that
   arrives once the rail has run out of room would be handed to the page,
   which is the lurch this is here to stop. Long enough to cover the beat
   between two flicks of one movement, short enough that a reader who is
   done with the rail and wants the page does not notice waiting. Measured
   from the last time the rail actually moved, so a rail sitting at its end
   releases the page on its own rather than holding it for as long as
   someone keeps pushing. */
const HANDOVER = 500;

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
export default function MemberRail({
  label,
  mobileHint,
  children,
}: {
  label: string;
  mobileHint?: string;
  children: ReactNode;
}) {
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

    /* A wheel is vertical and this rail is horizontal, so without this the
       only way past the fade with a mouse is the two arrows. Browsers only
       turn a vertical wheel sideways for a box that cannot scroll vertically
       at all, which an `overflow-x: auto` scroller is not — its other axis
       computes to auto too.

       Turned only for a gesture that is actually vertical: a trackpad's
       sideways swipe already arrives as deltaX and reaches the rail on its
       own, and taking that over would fight it. */
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    /* One push of the wheel moves one thing. Whichever it is keeps it until
       the push is over, and the other is held still for the duration.

       Deciding per event instead — the rail while it has somewhere to go,
       the page once it does not — is what made this unpleasant. A push that
       ran the rail to its end handed the rest of itself to the page, so the
       row stopped and the whole document lurched, out of one gesture the
       reader meant as one movement. The same fault the other way round: a
       push aimed at the page, passing over the rail on its way down, was
       taken off the page and spent scrolling members sideways.

       So the owner is chosen once, on the first notch of a push, and the
       rest of that push goes the same way. The rail holds the push even
       after it has run out of room — a rail at its end simply stops, which
       is the thing the reader can see and understand — and it goes on
       holding the ones that follow while HANDOVER says the reader is still
       working this rail. Only a push that arrives after the rail has been
       still for that long gives itself to the page. */
    let owner: "rail" | "page" | null = null;
    let lastWheelAt = 0;
    /* When the row itself last moved — not when it last held an event. A
       rail pinned at its end is not moving, so this stops being refreshed
       and the page comes free, however long someone keeps pushing at it. */
    let railMovedAt = 0;

    /* When the page itself last moved. A push that began somewhere else on
       the page and only wandered over the rail has to be recognised as
       already spoken for: our own handler never saw its first notch, so
       without this the notch that lands here looks like the start of a
       fresh push and the rail would take it. */
    let pageScrolledAt = 0;
    const onPageScroll = (event: Event) => {
      pageScrolledAt = event.timeStamp;
    };

    /* Where the rail is heading, and when it was last told. Moving it by the
       delta as each notch arrived put the row exactly where the wheel said,
       instantly, and then scroll-snap pulled it to the nearest tile — so a
       gesture that should have glided landed as a run of jumps. Asking for
       an absolute position and letting the browser animate to it gives one
       glide, and lets snap settle the row once at the end instead of on
       every notch.

       The heading has to be remembered rather than read back off the rail,
       because a notch landing mid-glide would otherwise be measured from
       wherever the animation had got to and cut the one before it short.
       Anything older than a glide is stale — an arrow, a drag or a Tab may
       have moved the rail since — so it is re-seeded from where the rail
       actually is. */
    let target: number | null = null;
    let targetAt = 0;

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      const max = el.scrollWidth - el.clientWidth;
      if (max <= 1) return;

      /* Firefox reports lines, and a page at a time is the rail's width.
         Both are rare next to the pixels every other browser sends, but a
         delta of 3 "lines" moved the rail three pixels. */
      const step =
        event.deltaMode === 1
          ? event.deltaY * 16
          : event.deltaMode === 2
            ? event.deltaY * el.clientWidth
            : event.deltaY;

      /* Against where the rail is heading, not where it has got to: a notch
         arriving on the last frame of a glide is the same push still
         running, and asking where the row happens to be mid-animation would
         cut it short. */
      const from = event.timeStamp - targetAt < GLIDE && target !== null ? target : el.scrollLeft;

      if (event.timeStamp - lastWheelAt >= IDLE) {
        /* A fresh push. The same pixel of slack the measurement takes, for
           the same reason. */
        const room = step < 0 ? from > 1 : from < max - 1;
        const working = event.timeStamp - railMovedAt < HANDOVER;
        owner =
          event.timeStamp - pageScrolledAt < IDLE || (!room && !working) ? "page" : "rail";
      }
      lastWheelAt = event.timeStamp;

      if (owner === "page") return;

      event.preventDefault();

      const next = Math.max(0, Math.min(max, from + step));
      /* Nothing to do for a rail already against the end it is being pushed
         at — but the push is still the rail's, and holding it here is the
         whole point: the page stays where the reader left it. */
      if (next === from) return;

      target = next;
      targetAt = event.timeStamp;
      railMovedAt = event.timeStamp;
      el.scrollTo({ left: target, behavior: reduced.matches ? "auto" : "smooth" });
    };

    measure();
    el.addEventListener("scroll", schedule, { passive: true });
    /* Not passive: the point is to prevent the page from taking the scroll. */
    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onPageScroll, { passive: true });

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
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onPageScroll);
      observer.disconnect();
    };
  }, []);

  const nudge = (direction: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    const list = track.current;
    const tile = list?.firstElementChild as HTMLElement | null;
    /* A press never moves more than a screenful: on a narrow viewport three
       tiles is further than the rail can show, and a jump past what was on
       screen loses the reader's place. */
    const stride =
      list && tile
        ? Math.min(
            (tile.getBoundingClientRect().width +
              (parseFloat(getComputedStyle(list).columnGap) || 0)) *
              TILES_PER_PRESS,
            el.clientWidth,
          )
        : el.clientWidth;
    /* CSS scroll-behavior does not reach a scrollBy that asks for smooth by
       name, so the preference is read here instead. */
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: direction * stride,
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

      {/* One instruction for the whole rail, after the thing that scrolls
          and its position marker. Repeating it in every mobile card made the
          row read like a row of buttons; here it explains the gesture once
          and stays out of the card's original proportions. Hidden from the
          accessibility tree because every card already names its GitHub
          destination outright. */}
      {mobileHint ? (
        <p
          aria-hidden
          className="member-rail-github-hint mt-3 text-right text-[12px] leading-normal font-medium text-accent"
        >
          {mobileHint}
        </p>
      ) : null}
    </div>
  );
}
