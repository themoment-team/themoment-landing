"use client";

import { useEffect, useRef, useState } from "react";

interface Options {
  threshold?: number;
  rootMargin?: string;
  /* For elements inside a RevealGroup, which take their cue from the group.
     There is no point attaching an observer per element when one is already
     watching for all of them. */
  enabled?: boolean;
}

/* Fires once, the first time the element crosses the trigger line, then
   stops observing. Everything on the page is an opening rather than an
   entrance: replaying a section on the way back up reads as the site
   restarting.

   threshold stays at 0 on purpose — an element taller than the viewport can
   never reach a fractional threshold, so the reveal would never fire at
   all. The negative bottom margin is what holds it back until the element
   has actually risen into the page. */
export function useInView<T extends HTMLElement = HTMLElement>({
  threshold = 0,
  rootMargin = "0px 0px -12% 0px",
  enabled = true,
}: Options = {}): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const node = ref.current;
    if (!node) return;

    /* Server-rendered markup reaches the browser hidden. If the observer is
       unavailable, everything shows rather than nothing. */
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setInView(true);
        observer.disconnect();
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, enabled]);

  return [ref, inView];
}

export default useInView;
