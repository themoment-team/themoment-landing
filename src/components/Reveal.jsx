import useInView from "../hooks/useInView";
import { useRevealGroup } from "../lib/revealGroup";

/* Fades in on its cue. The other variants add travel to that fade and are
   opt-in — the page below the hero asks for a plain fade throughout. */
export default function Reveal({
  as: Tag = "div",
  variant = "reveal-fade",
  delay = 0,
  threshold,
  className = "",
  children,
  ...rest
}) {
  /* A group above takes over the cue, and the element's own observer is not
     attached at all. */
  const group = useRevealGroup();
  const [ref, own] = useInView({
    enabled: group === null,
    ...(threshold === undefined ? {} : { threshold }),
  });
  const inView = group === null ? own : group;

  return (
    <Tag
      ref={ref}
      /* The stagger applies on the way in only, and there is no way out —
         the reveal fires once. */
      style={{ transitionDelay: inView && delay ? `${delay}ms` : "0ms" }}
      className={`${variant}${inView ? " is-in" : ""}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
