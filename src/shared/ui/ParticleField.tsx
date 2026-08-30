"use client";

import { useEffect, useRef } from "react";
import { mountParticleField, type ParticleField as Field } from "../lib/particleField";

/* The page's backdrop. Fixed to the viewport and under everything, so the
   grains keep moving as the page scrolls and their trails are never cut.

   aria-hidden because it is decoration with nothing to say, and
   pointer-events-none because a full-screen layer that takes clicks would
   swallow every link on the site. The pointer parallax still works — the
   field listens on window, not on itself.

   Held behind a fade so the first paint is not a hard cut: the shapes have
   to rasterise and the icons have to decode before there is anything to
   draw, which takes a few tens of milliseconds. */
export default function ParticleField({
  openDelay,
  onReady,
}: {
  openDelay?: number;
  onReady?: (field: Field) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /* Kept in a ref rather than the dependency list. As a dependency, an
     inline callback from the parent would tear down and rebuild the whole
     field — sixteen thousand grains and a re-rasterised mark — on every
     render of the page above it. */
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const field = mountParticleField(canvas, { openDelay });
    onReadyRef.current?.(field);

    /* StrictMode runs this twice in development. Without a destroy() that
       truly stops everything, the second mount leaves two animation loops
       and two star fields running — half the frame rate and twice the
       trail, and it does not reproduce in a production build. */
    return () => field.destroy();
  }, [openDelay]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
