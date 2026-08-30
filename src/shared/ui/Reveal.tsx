"use client";

import type { ElementType, ReactNode } from "react";
import useInView from "../lib/useInView";
import { useRevealGroup } from "../lib/revealGroup";

interface RevealProps {
  as?: ElementType;
  /* Plain fade is the page's default. The travelling variants are for the
     hero and for anything that should read as arriving rather than
     appearing. */
  variant?: "reveal" | "reveal-up" | "reveal-scale";
  delay?: number;
  threshold?: number;
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
}

export default function Reveal({
  as: Tag = "div",
  variant = "reveal",
  delay = 0,
  threshold,
  className = "",
  children,
  ...rest
}: RevealProps) {
  /* A group above takes over the cue, and this element's own observer is
     never attached. */
  const group = useRevealGroup();
  const [ref, own] = useInView({
    enabled: group === null,
    ...(threshold === undefined ? {} : { threshold }),
  });
  const inView = group === null ? own : group;

  /* Every variant carries the base class too — that is where the transition
     lives, and where `reveal-up` alone would have none. */
  const base = variant === "reveal" ? "reveal" : `reveal ${variant}`;

  return (
    <Tag
      ref={ref}
      /* The stagger applies on the way in only. There is no way out; the
         reveal fires once. */
      style={{ transitionDelay: inView && delay ? `${delay}ms` : "0ms" }}
      className={`${base}${inView ? " is-in" : ""}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
