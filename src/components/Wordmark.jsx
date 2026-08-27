import { useId } from "react";
import useInView from "../hooks/useInView";
import { BRAND_LETTER, FACETS, LETTERS } from "../lib/wordmark";

export default function Wordmark({ delay = 0, className = "" }) {
  const [ref, inView] = useInView({ threshold: 0, rootMargin: "0px" });
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const glyphsId = `wordmark-glyphs-${uid}`;

  return (
    <svg
      ref={ref}
      role="img"
      aria-label="THE MOMENT"
      preserveAspectRatio="none"
      overflow="visible"
      viewBox="0 0 1440 159"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`block w-full h-full ${className}`}
    >
      <defs>
        {LETTERS.map((d, i) => (
          <path
            key={i}
            id={`${glyphsId}-g${i}`}
            d={d}
            fill={i === BRAND_LETTER ? "#4A80F8" : "#292b2f"}
          />
        ))}

        {FACETS.map((facet, i) => (
          <clipPath key={i} id={`${glyphsId}-f${i}`}>
            <polygon points={facet.points} />
          </clipPath>
        ))}
      </defs>

      {FACETS.map((facet, i) => (
        <g key={i} clipPath={`url(#${glyphsId}-f${i})`}>
          <g
            className={`facet${inView ? " is-in" : ""}`}
            style={{
              transformOrigin: `${facet.cx.toFixed(1)}px ${facet.cy.toFixed(1)}px`,
              transitionDelay: inView
                ? `${(delay + facet.delay).toFixed(0)}ms`
                : "0ms",
              "--fx": `${facet.tx.toFixed(1)}px`,
              "--fy": `${facet.ty.toFixed(1)}px`,
              "--fr": `${facet.rot.toFixed(2)}deg`,
              "--fk": `${facet.skew.toFixed(2)}deg`,
              "--fs": facet.scale.toFixed(3),
              "--fd": inView ? `${facet.duration.toFixed(0)}ms` : "0ms",
            }}
          >
            {facet.glyphs.map((gi) => (
              <use key={gi} href={`#${glyphsId}-g${gi}`} />
            ))}
          </g>
        </g>
      ))}
    </svg>
  );
}
