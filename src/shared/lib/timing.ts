/* One clock for the whole page.

   BEAT  between one item and the next in the same run.
   GROUP between blocks that read as separate things within a section.

   Sections used to invent their own numbers — 90 here, 120 there — so
   nothing arrived on a shared rhythm. These are the only two intervals. */
export const BEAT = 90;
export const GROUP = 200;

/* The i-th item of a run, optionally starting a group in. */
export const beat = (i: number, from = 0): number => from + i * BEAT;

/* Has to match the .reveal transition in globals.css. Nothing reads a
   stylesheet at runtime, so it is written down in both places. */
export const REVEAL_RUNS = 900;

/* The opening. The animation itself lives in IntroOverlay.module.css and
   these have to match it — nothing reads a stylesheet at runtime — but they
   are kept here rather than in the widget because something outside it
   needs them too: the particle field waits for the cover to come off before
   it gathers, so that the mark forming is the first thing the hero shows
   rather than something that already happened behind the veil. */
export const INTRO = {
  /* tmDock's delay: the lockup starts up to the top. */
  dockAt: 2750,
  /* tmDock + tmVeilOut, done: 2750 + 950 and 2800 + 800 both land here. */
  ends: 3700,
};
