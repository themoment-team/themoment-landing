"use client";

import { useEffect, useState } from "react";
import ParticleField from "@/shared/ui/ParticleField";
import { preloadImages, warmImages } from "@/shared/lib/preloadImages";
import { INTRO } from "@/shared/lib/timing";
import IntroOverlay from "./IntroOverlay";

/* The field behind the page and the cover over it, held together because
   their timing is one thing.

   The page opens on solid black and stays there until the field has painted
   its first frame — the shapes are rasterised and the icons decoded after
   mount, so starting the opening on the first paint drew the mark over an
   empty canvas. Once the field is up the cover drops to 60%, the mark draws
   itself over it, and the whole lockup shrinks to the top of the screen.
   Only then do the navigation and the scroll cue arrive. */

/* The longest the black is allowed to last if the field never reports in —
   a tab opened in the background gets no animation frames, so the field can
   be perfectly healthy and still silent. Better a beat early over a canvas
   that is nearly ready than a page that never lifts. */
const FIELD_WAIT_CAP = 2000;

/* The same for the gather: the field is told to assemble at INTRO.ends and
   the last grain lands about a second and a half later, so this is that plus
   room for a slow start. */
const GATHER_CAP = INTRO.ends + 2500;

export default function Opening({ imageSources }: { imageSources: string[] }) {
  const [imagesReady, setImagesReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [assembled, setAssembled] = useState(false);

  /* The images on the first screen are fetched and decoded while the
     solid-black cover is fixed in place. Only those: the field behind the
     hero is not even mounted until this resolves, so anything waited on
     here is time the page spends black. Everything below the fold — the
     four stills, the thirty-odd portraits — is warmed after the opening
     instead, which is soon enough for content nobody has scrolled to. */
  useEffect(() => {
    let cancelled = false;

    void preloadImages().then(() => {
      if (!cancelled) setImagesReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  /* Once the opening is over there is nothing left for a request to get in
     front of, so the rest of the page's images are fetched now rather than
     when a rail is dragged sideways onto a portrait that has not started
     loading. Fire and forget: nothing renders differently for it. */
  useEffect(() => {
    if (!assembled) return;
    warmImages(imageSources);
  }, [assembled, imageSources]);

  useEffect(() => {
    if (!imagesReady || started) return;
    const cap = window.setTimeout(() => setStarted(true), FIELD_WAIT_CAP);
    return () => window.clearTimeout(cap);
  }, [imagesReady, started]);

  /* The navigation and the scroll cue wait for the grains to finish
     assembling into the mark — the field says when, rather than a timer
     guessing at it. Between asking for the gather and the last grain
     landing is about a second and a half, and that is the part worth
     waiting out.

     They are hung off an attribute on the root rather than passed down:
     they live in the hero, which is a server component several levels away,
     and threading a boolean through it would make it a client component for
     one class name. "holding" is set rather than the absence of the
     attribute meaning hidden — a page whose JavaScript never runs sets
     nothing, and has to end up showing them. */
  useEffect(() => {
    document.documentElement.dataset.intro = assembled ? "done" : "holding";
  }, [assembled]);

  /* And the same kind of backstop as above, for the same reason: no frames,
     no report. It starts with the intro, so time spent preloading does not
     make the navigation appear before the particles have assembled. */
  useEffect(() => {
    if (!started || assembled) return;
    const cap = window.setTimeout(() => setAssembled(true), GATHER_CAP);
    return () => window.clearTimeout(cap);
  }, [assembled, started]);

  return (
    <>
      {imagesReady ? (
        <ParticleField
          openDelay={INTRO.ends}
          onReady={() => setStarted(true)}
          onGathered={() => setAssembled(true)}
        />
      ) : null}
      <IntroOverlay start={started} />
    </>
  );
}
