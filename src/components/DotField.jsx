import { useEffect, useRef } from "react";

/* A fixed lattice of dots with turbulence running through it.

   The lattice is drawn on a canvas rather than as a repeating background,
   because a background image paints every dot at one size — the field could
   only brighten and dim as a whole. Positions and spacing stay fixed; what
   changes per frame is each dot's radius, alpha and colour.

   Two things drive a dot:

     turbulence  domain-warped ridged noise, which is what gives the field
                 its fine irregular grain. Crossed sine waves cannot do this
                 — they interfere on a lattice you can read, and the result
                 reads as a pattern rather than as movement.
     stroke      the pointer paints: a pool of open dots sits under the
                 cursor wherever it rests, and moving drags stamps along the
                 path it took, each opening the dots around it to full size
                 and the brand blue and then closing them again.

   So the field answers the pointer in two ways at once. The pool is anchored
   to where the pointer is and does not run out, so a still hand still has
   the field lit under it; the stamps are anchored to where it has been, and
   those do run out, which is what leaves a wake trailing off behind a fast
   hand rather than a disc dragged around.

   `bare` drops the lattice and keeps the pointer: no turbulence, and a dot
   is drawn only where the stroke actually reaches it. It is also most of the
   cost, so a bare field skips its frame entirely while nothing is live.

   Nothing renders one now. The sections down the page used to, so the stroke
   followed the pointer the length of the site; the field belongs to the hero
   alone, and everything below it is still under the cursor. */

const SPACING = 24;

/* A crest dot has to be a real share of its cell or the grain does not read
   however wide its range is: at 3.2px into a 30px cell the field measured
   full contrast and still looked flat, because 6px of ink in a 30px cell is
   6px of ink either way. The floor stays above zero so a dot at the bottom
   of the swell shrinks rather than disappearing.

   The crest runs to a fifth of the cell and the floor to a speck: 14x on
   radius, 204x on area. At 0.7-4.2 the two ends were recognisably the same
   dot at two sizes, which is why the field read as one texture breathing
   rather than as something moving through it. */
const R_MIN = 0.35;
const R_MAX = 5;
const A_MIN = 0.05;
const A_MAX = 0.95;

/* The swell carries lightness as well as size. Holding every dot at one grey
   left the crests to separate themselves on area alone, and a big dot and a
   small dot of the same colour still read as one material; a crest that is
   also brighter reads as lit. */
const DIM = [96, 102, 112];
const LIT = [206, 212, 222];
const BRAND = [74, 128, 248]; // #4A80F8

/* ---------- turbulence ---------- */

function hash(ix, iy) {
  let h = Math.imul(ix, 374761393) + Math.imul(iy, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function vnoise(x, y) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

/* Each octave drifts on its own heading, so the field churns in place
   instead of sliding across the screen as one sheet. The finest octave is
   about 73px at the scale below — no octave may go under twice the 24px
   lattice spacing, or the dots sample it as moire instead of grain.

   Weight is spread towards the finer octaves. At 0.54 the coarsest carried
   the field on its own, and its features are 300px across: a fifth of the
   band would be one value, so a dot had no visible step to any of its
   neighbours and whole regions set into a single size. Modelled over the
   band's own lattice, cells with all four neighbours within 0.06 of them
   went from 19.6% of the field to 3.2%.

   These headings are now only the shape changing as it goes; the going
   itself is FLOW below. At full strength they were most of the motion, and
   motion that cancels between octaves has no direction in it — correlating
   the field against itself half a second later, the best match sat at zero
   displacement. Nothing was travelling anywhere. The field had energy and
   no current, which is what makes something read as seething rather than as
   alive. At a fraction of it the shape still evolves as it moves, but the
   moving is what you see. These scale with FLOW: slowing the current without
   slowing the boil under it just puts the field back towards seething. */
const OCT = [
  { f: 1, amp: 0.42, dx: 0.037, dy: -0.023 },
  { f: 2.03, amp: 0.33, dx: -0.028, dy: 0.047 },
  { f: 4.11, amp: 0.25, dx: 0.056, dy: 0.023 },
];
const NORM = OCT.reduce((s, o) => s + o.amp, 0);
/* How much of the ridge's tip is rounded off — see the fold below. */
const RIDGE_ROUND = 0.3;

function fbm(x, y, t, seed, ridged) {
  let sum = 0;
  for (const o of OCT) {
    let v = vnoise(x * o.f + t * o.dx + seed, y * o.f + t * o.dy + seed * 1.7);
    /* Ridged: folding the noise about its midpoint turns smooth hills into
       creases, which is the difference between a field that undulates and
       one that looks like something is flowing through it.

       The fold is rounded rather than sharp. An absolute value has a corner,
       and a corner in the fold is a corner in time as well as in space: a
       dot riding over the crease climbed and then reversed in a single
       frame, with nothing easing the turn — visibly a dot swelling and then
       snapping shut. Reversals with real motion either side of them fell
       from 0.8% of frames to 0.1%, and the harshest of them from 0.134 to
       0.073. Below the threshold the fold is a parabola, which meets the
       absolute value in both value and slope, so the creases away from the
       tip are exactly as they were. */
    if (ridged) {
      const k = v * 2 - 1;
      const a = Math.abs(k);
      v = 1 - (a < RIDGE_ROUND ? (k * k) / (2 * RIDGE_ROUND) + RIDGE_ROUND / 2 : a);
    }
    sum += o.amp * v;
  }
  return sum / NORM;
}

const SCALE = 1 / 300;
/* The whole field is carried along one heading, and the heading itself
   swings slowly. This is what the eye can follow: features hold together and
   travel, rather than each octave pulling its own way and cancelling. Half a
   A second apart the field matches itself at 0.89 two cells downstream
   against 0.29 where it was: what changes is overwhelmingly the field
   arriving somewhere, not the field churning in place.

   The swing is integrated frame by frame rather than evaluated from the
   clock: a direction that varies with t multiplied by t is a pendulum whose
   swing grows without bound, not a current that wanders. */
const FLOW_SPEED = 40; // px per second
const FLOW_ANGLE = -0.34; // radians, a shallow rise to the right
const FLOW_SWING = 0.5; // radians either side of it
/* 40 is about the floor. A second of travel is under two lattice steps at
   this speed; below 30 it is under one, and a current that moves a feature
   less than the gap between two dots is not a current anyone can see. */
const FLOW_SWING_HZ = 0.045; // a little over twenty seconds a cycle
/* Seconds for a dot to close most of the gap to the size the turbulence is
   asking for. Short enough that the field does not lag behind its own flow,
   long enough that no dot can snap. */
const SWELL_EASE = 0.04;
/* How often the turbulence is asked what it wants, as against how often the
   dots are drawn. Sampling it is nearly the whole cost of a frame — nine
   noise lookups per dot, thirteen hundred dots on the hero band — and at
   sixty a second the field spent most of the budget deciding on sizes that
   the easing above then refuses to move to in one frame anyway.

   Thirty is under SWELL_EASE, so no dot reaches a target before the next one
   is set and none of them ever sits waiting: the eased value is still moving
   every frame, which is what is actually on screen. Going to fifteen is
   visible — the ease constant is 40ms and the wait is 67, so the field
   arrives and pauses, and the flow starts to read as steps. */
const TURB_HZ = 30;
const TURB_STEP = 1 / TURB_HZ;
const TAU = Math.PI * 2;
/* Warping the sample point by another pair of noise fields is what curls the
   grain into filaments rather than blobs. The warp fields carry time too, so
   raising this deepens the curl and quickens it at once. */
const WARP = 3.6;
/* Ridged noise is not centred on 0.5 and its spread is narrower than plain
   fBm, so the midpoint and contrast are measured off the field rather than
   assumed — mean 0.649, sigma 0.160, and a gain that puts two sigma at the
   edges of the range. Rounding the tip of the fold takes the top off the
   ridged distribution, so the midpoint came down with it: at 0.66 the field
   lost a fifth of its swell and clumped half again as much. */
const TURB_MID = 0.58;
/* Two sigma at the edges of the range would be the faithful mapping, but it
   leaves the field sitting in its middle, where a dot is never much larger
   or smaller than its neighbour and the grain reads as uniform however fine
   it actually is. Pushing past that clips both tails, which is what puts
   dark water between the bright filaments — but only so far: at 1.95 more
   than half the field was pinned at the ceiling, which flattens every crest
   into one plateau and loses the shape inside it.

   1.75 still pinned 8.7% of the field at the ceiling and 22.2% at the floor,
   and a pinned run is a clump by definition — every dot in it the same size.
   The response curve below does the separating now, so the gain does not
   have to clip to get it: at 1.35 the ceiling holds 1.0% and the floor 8.9%,
   and the field still measures 0.82 between its tenth and ninetieth
   percentile out of a possible 1. */
const TURB_GAIN = 1.35;
/* The turbulence takes nearly the whole swell. The stroke overrides size
   outright rather than adding to it, so it needs no headroom reserved. */
const TURB_FLOOR = 0.02;
const TURB_SPAN = 0.92;

function turbulence(x, y, t, fx, fy) {
  const nx = (x - fx) * SCALE;
  const ny = (y - fy) * SCALE;
  const wx = fbm(nx, ny, t, 0, false) - 0.5;
  const wy = fbm(nx, ny, t, 11.3, false) - 0.5;
  const v = fbm(nx + WARP * wx, ny + WARP * wy, t, 3.7, true);
  return Math.min(1, Math.max(0, (v - TURB_MID) * TURB_GAIN + 0.5));
}

/* ---------- the stroke ---------- */

/* The pointer paints. A pool of light sits under the cursor for as long as
   it is over the field, and moving lays down a run of stamps along the path
   it actually took, each of which opens the dots around it and then closes
   them again — so what you see is a brush stroke drawn through the field,
   trailing off behind the cursor and pooling wherever it stops.

   Stamps are laid every TRAIL_STEP px of travel rather than per event, so
   the stroke has the same density whether the hand is fast or slow. */
const TRAIL_STEP = 7;
const TRAIL_RADIUS = 92;
const TRAIL_LIFE = 0.5;
/* Open quickly, close slowly. Without the attack a dot is simply at full
   size the instant the stamp lands, which reads as switching on rather than
   as being painted over.

   How long it takes is also how far behind the cursor the bright end of the
   stroke sits: the newest stamps are the ones under the hand, and while
   those are still opening, the brightest ink in the field is whatever was
   laid an attack ago. At 90ms an ordinary flick left it most of a
   fingertip behind, the stroke visibly trailing the pointer and then
   catching up as the hand slowed. 35ms still opens rather than switches,
   and it keeps the bright end under the cursor. */
const TRAIL_ATTACK = 0.035;
const R_TRAIL = 6.8;
const A_TRAIL = 0.92;

/* A hand that has stopped keeps laying stamps where it is, one every
   HOLD_STEP, so resting under the pointer is the same brush doing the same
   thing as drawing with it — only with nowhere new to put the ink. The wake
   still runs out behind it; what is under the cursor is renewed.

   This was a disc centred on the cursor, laid over the stamps. It read as a
   light with a shadow around it: a disc falls off over its radius while a
   stroke holds its strength the length of the path, so between the two sat
   a ring darker than either — the field looking like it had come loose from
   the pointer and caught up again. One brush, one profile, no seam. */
const HOLD_STEP = 0.022;

function bristle(age) {
  if (age < 0 || age >= TRAIL_LIFE) return 0;
  if (age < TRAIL_ATTACK) return age / TRAIL_ATTACK;
  const k = (age - TRAIL_ATTACK) / (TRAIL_LIFE - TRAIL_ATTACK);
  return (1 - k) * (1 - k);
}

const HALO_FROM = 0.34;
const HALO_ALPHA = 0.5;
const HALO_SIZE = 32;

/* The glow is one pre-rendered sprite rather than a canvas shadow per dot.
   Shadows are recomputed on every fill, and there can be a few hundred lit
   dots in frame. */
function makeHalo() {
  const size = HALO_SIZE * 2;
  const sprite = document.createElement("canvas");
  sprite.width = size;
  sprite.height = size;
  const g = sprite.getContext("2d");
  const grad = g.createRadialGradient(
    HALO_SIZE,
    HALO_SIZE,
    0,
    HALO_SIZE,
    HALO_SIZE,
    HALO_SIZE,
  );
  grad.addColorStop(0, `rgba(${BRAND[0]}, ${BRAND[1]}, ${BRAND[2]}, 0.9)`);
  grad.addColorStop(0.4, `rgba(${BRAND[0]}, ${BRAND[1]}, ${BRAND[2]}, 0.28)`);
  grad.addColorStop(1, `rgba(${BRAND[0]}, ${BRAND[1]}, ${BRAND[2]}, 0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return sprite;
}

export default function DotField({ on = false, bare = false, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!on) return undefined;
    const canvas = ref.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    const halo = makeHalo();
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const start = performance.now();
    const clock = () => (performance.now() - start) / 1000;

    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let stride = 0;
    /* The lattice is fitted to the box rather than laid into it. SPACING is
       the step it aims for; the step it gets divides the box a whole number
       of times, and each dot sits at the centre of its own cell — so the
       outer ones are half a step in and no dot is ever cut by an edge.

       Laid in at a fixed 24 the top row started flush at y = 0 and was
       sliced in half, with a 3px strip of nothing along the bottom. Putting
       a row on each edge instead cut every edge dot rather than only the top
       one, and centring the whole grid pushed the outer rows a clear 10px
       off both edges. The step never moves more than a couple of percent
       from 24, which nothing can see. */
    let stepX = SPACING;
    let stepY = SPACING;
    /* How much stroke is on each lattice point this frame. Splatting the
       stamps into a grid the size of the lattice and reading one cell per
       dot costs a fraction of testing every dot against every stamp — a
       quick drag can have seventy stamps alive at once against eighteen
       hundred dots. */
    let paint = new Float32Array(0);
    /* How far the field has been carried so far, and when it was last
       advanced. Accumulated rather than derived from the clock, because the
       heading swings — see FLOW_SWING. */
    let flowX = 0;
    let flowY = 0;
    let flowAt = 0;
    /* Each dot's swell as it was last frame, so a dot eases towards the
       turbulence rather than tracking it exactly. A short constant — under
       three frames — so nothing lags visibly; it only caps how fast a dot
       may change size. */
    let ease = new Float32Array(0);
    let eased = false;
    /* What the turbulence last asked of each dot, held between the frames
       that do not ask it again. */
    let want = new Float32Array(0);
    let wantAt = -1;
    let blank = false;
    let dirty = true;
    /* Now that fields run the length of the page, one drawing off screen is
       a whole frame budget spent on nothing — the hero's turbulence alone
       was costing 3.9ms a frame from three sections away. */
    let onScreen = true;
    let raf = 0;
    let trail = [];
    /* Where the last stamp landed, so the next one is placed by distance
       travelled rather than by event. */
    let lastX = 0;
    let lastY = 0;
    let seeded = false;
    /* The pointer's last known place, in client coordinates rather than in
       the canvas box: the box moves under it as the page scrolls, and a
       position stored relative to the box would leave the pool behind on the
       part of the section that has gone by. It is turned into box
       coordinates once a frame instead. */
    let clientX = 0;
    let clientY = 0;
    let hasCursor = false;
    /* When the brush last put anything down, whether the hand moved it there
       or it was simply still. */
    let stampedAt = -1;

    const size = () => {
      const box = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = box.width;
      h = box.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(1, Math.round(w / SPACING));
      rows = Math.max(1, Math.round(h / SPACING));
      stepX = w / cols;
      stepY = h / rows;
      stride = cols;
      paint = new Float32Array(cols * rows);
      ease = new Float32Array(cols * rows);
      want = new Float32Array(cols * rows);
      wantAt = -1;
      eased = false;
      dirty = true;
    };

    const move = (e) => {
      /* Recorded before the visibility check: the pointer may well have
         moved while this field was off screen, and the brush has to come
         back down where it actually is rather than where it was last seen. */
      clientX = e.clientX;
      clientY = e.clientY;
      hasCursor = true;
      if (!onScreen) return;
      const box = canvas.getBoundingClientRect();
      const nx = e.clientX - box.left;
      const ny = e.clientY - box.top;

      if (!seeded) {
        lastX = nx;
        lastY = ny;
        seeded = true;
        return;
      }

      const step = Math.hypot(nx - lastX, ny - lastY);

      /* Stamp along the segment, not at the event. Pointer events arrive far
         apart during a fast flick, and stamping only where they land leaves
         a dotted line of separate blobs instead of a stroke. */
      if (step >= TRAIL_STEP && !still) {
        const steps = Math.min(32, Math.round(step / TRAIL_STEP));
        const born = clock();
        for (let i = 1; i <= steps; i++) {
          const k = i / steps;
          trail.push({
            x: lastX + (nx - lastX) * k,
            y: lastY + (ny - lastY) * k,
            born,
          });
        }
        lastX = nx;
        lastY = ny;
        stampedAt = born;
      }
      dirty = true;
    };

    /* Only a pointer that has left the document, not one crossing between
       two elements inside it — pointerout fires for both, and the one that
       leaves has nothing on the other side of it. */
    const out = (e) => {
      if (!e.relatedTarget) hasCursor = false;
    };

    /* Lay the live stamps onto the lattice grid. Each takes the strongest
       rather than the sum, so overlapping stamps along one stroke give an
       even band instead of a bright seam wherever the hand slowed down. */
    const splat = (x, y, radius, env) => {
      if (env <= 0) return;
      const c0 = Math.max(0, Math.floor((x - radius) / stepX - 0.5));
      const c1 = Math.min(cols - 1, Math.ceil((x + radius) / stepX - 0.5));
      const r0 = Math.max(0, Math.floor((y - radius) / stepY - 0.5));
      const r1 = Math.min(rows - 1, Math.ceil((y + radius) / stepY - 0.5));
      for (let row = r0; row <= r1; row++) {
        const dy = (row + 0.5) * stepY - y;
        for (let col = c0; col <= c1; col++) {
          const dx = (col + 0.5) * stepX - x;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d >= radius) continue;
          const f = 1 - d / radius;
          const e = f * f * (3 - 2 * f) * env;
          const i = row * stride + col;
          if (e > paint[i]) paint[i] = e;
        }
      }
    };

    const layStroke = (t) => {
      paint.fill(0);
      for (const s of trail) splat(s.x, s.y, TRAIL_RADIUS, bristle(t - s.born));
    };

    const draw = (t, catchUp) => {
      ctx.clearRect(0, 0, w, h);
      layStroke(t);

      /* Whether this is one of the frames that asks the turbulence. Every
         frame still eases towards whatever it last said.

         A deadline accumulated rather than a gap measured back from now.
         Both of the obvious ways cost a third of the rate: asking for a full
         step since the last ask leaves the frame that lands on the deadline
         a whisker short, and setting the next deadline a step past the frame
         that took it moves it past the one that should have. Either way only
         every third frame qualifies and thirty a second comes out as
         twenty-one. Adding the step to the deadline itself keeps the cadence
         on alternate frames; the clamp is for a tab that has been away, so
         it picks up from now rather than asking on every frame until it has
         caught up with where it should have been. */
      const ask = !bare && t >= wantAt;
      if (ask) {
        wantAt += TURB_STEP;
        if (wantAt < t) wantAt = t + TURB_STEP;
      }

      for (let row = 0; row < rows; row++) {
        const y = (row + 0.5) * stepY;
        for (let col = 0; col < cols; col++) {
          const x = (col + 0.5) * stepX;

          /* The stroke is the only thing that carries the brand colour;
             everything else in the field stays grey. */
          const cell = row * stride + col;
          const lit = paint[cell];

          if (bare && lit < 0.012) continue;

          let r = R_TRAIL * lit;
          let a = A_TRAIL * lit;
          /* How far up the swell this dot is, and so how light it burns. A
             bare field has no swell, so its dots sit at the top of the ramp
             and the stroke takes them the rest of the way to brand. */
          let swell = 1;

          if (!bare) {
            if (ask) {
              const n = TURB_FLOOR + turbulence(x, y, t, flowX, flowY) * TURB_SPAN;
              const c = Math.min(1, Math.max(0, n));
              /* Smoothstepped twice. One pass leaves most of the field in
                 its middle, where a dot is never much bigger than its
                 neighbour and the grain reads as uniform however wide the
                 range is; the second pass pushes each side of the midpoint
                 towards its own end, so contraction and expansion separate.
                 Raising the gain instead would do it by clipping, which
                 flattens the crests into one plateau and loses the shape
                 inside them. */
              const s1 = c * c * (3 - 2 * c);
              want[cell] = s1 * s1 * (3 - 2 * s1);
            }
            const target = want[cell];
            swell = eased ? ease[cell] + (target - ease[cell]) * catchUp : target;
            ease[cell] = swell;
            /* Override, not addition: under the stroke a dot is this size
               whatever the turbulence was doing there. */
            r = Math.max(r, R_MIN + swell * (R_MAX - R_MIN));
            a = Math.max(a, A_MIN + swell * (A_MAX - A_MIN));
          }

          if (lit > HALO_FROM) {
            const g = (lit - HALO_FROM) / (1 - HALO_FROM);
            ctx.globalAlpha = g * g * HALO_ALPHA;
            const spread = r * 7;
            ctx.drawImage(halo, x - spread / 2, y - spread / 2, spread, spread);
          }

          ctx.globalAlpha = Math.min(1, a);
          /* Two ramps in one colour: dim to lit across the swell, then that
             towards brand under the stroke. */
          const ch = (i) => {
            const grey = DIM[i] + (LIT[i] - DIM[i]) * swell;
            return Math.round(grey + (BRAND[i] - grey) * lit);
          };
          ctx.fillStyle = `rgb(${ch(0)}, ${ch(1)}, ${ch(2)})`;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      if (!bare) eased = true;
    };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (!onScreen) return;
      const t = (now - start) / 1000;

      /* Reduced motion holds the turbulence still and lays no stroke, so the
         field is a static lattice and only repaints when it has been
         resized. */
      if (still) {
        if (!dirty) return;
        dirty = false;
        draw(0, 1);
        return;
      }

      /* Clamped: a backgrounded tab hands back one enormous gap on its way
         in, and an unclamped step would jump the field a screen sideways in
         a single frame. */
      const step = Math.min(0.05, Math.max(0, t - flowAt));
      flowAt = t;
      const heading = FLOW_ANGLE + FLOW_SWING * Math.sin(t * FLOW_SWING_HZ * TAU);
      flowX += Math.cos(heading) * FLOW_SPEED * step;
      flowY += Math.sin(heading) * FLOW_SPEED * step;

      if (trail.length && t - trail[0].born > TRAIL_LIFE) {
        trail = trail.filter((s) => t - s.born <= TRAIL_LIFE);
      }

      /* The brush goes on painting where it is. The box is read here rather
         than in the pointer handler because the pointer can sit perfectly
         still while the page scrolls under it, and the ink has to keep
         landing under the cursor rather than on the piece of section that
         happened to be there. */
      if (hasCursor && t - stampedAt >= HOLD_STEP) {
        const box = canvas.getBoundingClientRect();
        const px = clientX - box.left;
        const py = clientY - box.top;
        /* A pointer just off the edge still reaches the dots inside it; one
           further off than the stamp is wide reaches nothing, and a field
           with nothing else to draw should know that rather than splatting
           into empty ranges every frame. */
        if (
          px > -TRAIL_RADIUS &&
          py > -TRAIL_RADIUS &&
          px < w + TRAIL_RADIUS &&
          py < h + TRAIL_RADIUS
        ) {
          trail.push({ x: px, y: py, born: t });
          lastX = px;
          lastY = py;
          seeded = true;
        }
        stampedAt = t;
      }

      /* A bare field has nothing of its own to animate, so with no stroke on
         it there is no frame to draw — one clear on the way down, then it
         costs nothing until the pointer comes back. */
      if (bare && !trail.length) {
        if (!blank) {
          ctx.clearRect(0, 0, w, h);
          blank = true;
        }
        return;
      }
      blank = false;

      draw(t, 1 - Math.exp(-step / SWELL_EASE));
    };

    size();
    raf = requestAnimationFrame(frame);

    const observer = new ResizeObserver(size);
    observer.observe(canvas);
    /* The margin keeps a field awake just before it arrives, so a stroke
       started off the edge is already on it rather than beginning at the
       fold. */
    const visible = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
      },
      { rootMargin: "160px" },
    );
    visible.observe(canvas);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerout", out, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      visible.disconnect();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerout", out);
    };
  }, [on, bare]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`dot-field${on ? " is-on" : ""} ${className}`}
    />
  );
}
