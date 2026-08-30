import { WORDMARK_RUNS } from "./wordmark";

/* One clock for the whole page. Sections used to invent their own numbers —
   90 here, 120 there, 140 and 320 elsewhere — so nothing arrived on a shared
   rhythm. These are the only two intervals in use.

   BEAT  between one item and the next in the same run.
   GROUP between blocks that read as separate things within a section. */
export const BEAT = 90;
export const GROUP = 200;

/* i-th item of a run, optionally starting a group in. */
export const beat = (i, from = 0) => from + i * BEAT;

/* These three have to match index.css: the reveal transition, the band
   inverting, and the dots fading up on it. Nothing reads a stylesheet at
   runtime, so they are written down in both places. */
export const REVEAL_RUNS = 950;
export const INVERT_RUNS = 520;
export const DOTS_RUNS = 460;

/* The hero opens on one cue. The wordmark gathers out of its facets, the
   navigation arrives, and the band inverts — all from the same instant, so
   the opening is over at whichever of them runs longest rather than at the
   sum of them. It used to be a chain that only reached the band once the
   mark had settled, which put the last of it nearly a second later.

   The band is still two beats within itself: it inverts, and the dots come
   up on the dark once it has. That order is the point — the field reads as
   appearing on a background that turned, not as arriving with it.

   Every length here is asked of whatever owns that length rather than
   estimated. */
const OPEN_AT = 140;
const MARK_RUNS = WORDMARK_RUNS;
const NAV_RUNS = 3 * BEAT + REVEAL_RUNS; // last link's stagger plus its travel
const DOTS_AT = OPEN_AT + INVERT_RUNS;

export const HERO = {
  mark: OPEN_AT,
  nav: OPEN_AT,
  invert: OPEN_AT,
  dots: DOTS_AT,
  ends: Math.max(OPEN_AT + MARK_RUNS, OPEN_AT + NAV_RUNS, DOTS_AT + DOTS_RUNS),
};
