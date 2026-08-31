"use client";

import { useEffect, useRef } from "react";
import { mountParticleField, type ParticleField as Field } from "../lib/particleField";

/* Once the first screen is behind you the mark comes apart again. The hero is
   where the mark is the subject; everywhere below it the field is a backdrop
   behind text, and a sharp logo sitting in the middle of it competes with
   whatever is being read. Scattered, it is a drifting dust cloud — and the
   icon cycle stops with it, because the field only cycles while gathered.

   A third of a screen rather than a whole one, so the mark has begun letting
   go by the time the next section's heading is in place rather than
   dissolving under it. Scrolling back to the top gathers it again. */
const SCATTER_AT = 0.35;

/* The page's backdrop. Fixed to the viewport and under everything, so the
   grains keep moving as the page scrolls and their trails are never cut.

   aria-hidden because it is decoration with nothing to say, and
   pointer-events-none because a full-screen layer that takes clicks would
   swallow every link on the site. The pointer parallax still works — the
   field listens on window, not on itself. */
export default function ParticleField({
  openDelay,
  onReady,
}: {
  openDelay?: number;
  onReady?: (field: Field) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<Field | null>(null);
  /* Kept in a ref rather than the dependency list. As a dependency, an inline
     callback from the parent would tear down and rebuild the whole field —
     sixteen thousand grains and a re-rasterised mark — on every render of the
     page above it. */
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const field = mountParticleField(canvas, { openDelay });
    fieldRef.current = field;
    onReadyRef.current?.(field);

    /* StrictMode runs this twice in development. Without a destroy() that
       truly stops everything, the second mount leaves two animation loops and
       two star fields running — half the frame rate and twice the trail, and
       it does not reproduce in a production build. */
    return () => {
      fieldRef.current = null;
      field.destroy();
    };
  }, [openDelay]);

  useEffect(() => {
    let raf = 0;

    const apply = () => {
      raf = 0;
      const field = fieldRef.current;
      if (!field) return;
      const away = window.scrollY > window.innerHeight * SCATTER_AT;
      /* Both are no-ops when the field is already in that state, but asking
         first keeps the intent readable. */
      if (away && field.isGathered()) field.scatter();
      else if (!away && !field.isGathered()) field.gather();
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(apply);
    };

    /* The field gathers itself once, on its own timer, at the end of the
       intro. Someone who scrolled away during the intro is standing
       somewhere else by then and would watch the mark assemble behind their
       text — so the position is asked again just after that moment, when no
       scroll event is coming to ask it for us. */
    const settle = window.setTimeout(apply, (openDelay ?? 430) + 120);

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(settle);
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [openDelay]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
