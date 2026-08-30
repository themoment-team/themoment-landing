"use client";

import type { ElementType, ReactNode } from "react";
import useInView from "../lib/useInView";
import { RevealGroupContext } from "../lib/revealGroup";

/* Watches once for everything inside it. The Reveals within pick the cue up
   through the context and skip their own observers, so a section arrives as
   one gesture with its own internal stagger rather than as a run of
   separate entrances.

   The trigger is this element, so wrap the content you want treated as one
   thing — a section's whole body, usually. */
export default function RevealGroup({
  as: Tag = "div",
  className = "",
  children,
  ...rest
}: {
  as?: ElementType;
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
}) {
  const [ref, inView] = useInView();

  return (
    <RevealGroupContext.Provider value={inView}>
      <Tag ref={ref} className={className} {...rest}>
        {children}
      </Tag>
    </RevealGroupContext.Provider>
  );
}
