import { useEffect, useRef, useState } from "react";

/* Fires once, the first time the element crosses the trigger line, and then
   stops observing. Everything on the page is an opening rather than an
   entrance: replaying a section on the way back up reads as the site
   restarting.

   threshold stays at 0 on purpose: an element taller than the viewport can
   never reach a fractional threshold, so the reveal would never fire. The
   negative bottom margin is what holds the reveal back until the element has
   actually risen into the page.

   `enabled` is for elements inside a RevealGroup, which take their cue from
   the group instead — there is no point attaching an observer per element
   when one is already watching for all of them. */
export default function useInView({
  threshold = 0,
  rootMargin = "0px 0px -12% 0px",
  enabled = true,
} = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const node = ref.current;
    if (!node) return;

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
