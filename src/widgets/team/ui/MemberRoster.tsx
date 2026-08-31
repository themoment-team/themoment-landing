"use client";

import { useEffect, useRef, useState } from "react";
import MemberCard, { CHIP_SHELL } from "@/entities/teamMember/ui/MemberCard";
import type { TeamMember } from "@/entities/teamMember/model/types";
import Reveal from "@/shared/ui/Reveal";
import { GROUP, beat } from "@/shared/lib/timing";

/* The parts, in the order the comp lists them. A part that turns up in the
   data but not here is appended rather than dropped: a role spelled some
   other way in Notion should cost the team a tidy tab order, not a member. */
const PART_ORDER = ["Frontend", "Server", "Design", "DevOps"];

function partsIn(members: TeamMember[]): string[] {
  const present = new Set(members.map((m) => m.role).filter(Boolean));
  const known = PART_ORDER.filter((part) => present.has(part));
  const rest = [...present].filter((part) => !PART_ORDER.includes(part)).sort();
  return [...known, ...rest];
}

/* One part at a time, chosen from the row of tabs above — the comp's own
   structure. The generation rides on each chip instead, which is what lets
   the list be cut by part and still say which year someone is from. */
export default function MemberRoster({ members }: { members: TeamMember[] }) {
  const parts = partsIn(members);
  const [active, setActive] = useState(parts[0] ?? "");
  const shown = members.filter((member) => member.role === active);

  /* Server has fifteen people and Design has two. Left to itself the grid
     would be three rows deep on one tab and one row on another, and the
     section — and everything below it — would jump by two rows every time
     someone pressed a tab. So every tab lays out the same number of cells
     and the extras are simply empty. Counted from the data rather than
     written down, so it stays true as the team changes. */
  const slots = parts.reduce(
    (most, part) => Math.max(most, members.filter((m) => m.role === part).length),
    0,
  );
  const blanks = Math.max(0, slots - shown.length);

  /* The underline is one bar that moves, not a border that switches on and
     off under whichever tab is current. */
  const tabsRef = useRef<HTMLUListElement>(null);
  const [bar, setBar] = useState<{ left: number; top: number; width: number } | null>(null);

  useEffect(() => {
    const list = tabsRef.current;
    if (!list) return;

    const move = () => {
      const tab = list.querySelector<HTMLElement>(`[data-part="${CSS.escape(active)}"]`);
      if (!tab) return;
      /* offsetLeft/Top are measured against the list, which is positioned
         for exactly this reason. Reading the offsets rather than
         getBoundingClientRect keeps the numbers in the list's own
         coordinates and out of the page's scroll position. */
      setBar({ left: tab.offsetLeft, top: tab.offsetTop + tab.offsetHeight - 1, width: tab.offsetWidth });
    };

    move();

    /* Measuring once is not enough. Pretendard arrives from a CDN after the
       first paint, and when it swaps in every tab changes width — the bar
       was left sized and placed for the fallback font, off by seventy pixels
       and a whole tab to the left, until a click happened to re-measure it.

       Watching the tabs themselves catches that, and catches the centred row
       shifting when the window changes width, without needing to know which
       of the two happened. */
    const observer = new ResizeObserver(move);
    for (const tab of list.querySelectorAll<HTMLElement>("[data-part]")) observer.observe(tab);

    window.addEventListener("resize", move);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", move);
    };
  }, [active]);

  return (
    <>
      <Reveal delay={GROUP} className="w-full">
        {/* Buttons, not links: they change what this list shows and go
            nowhere. aria-pressed is what tells a screen reader which one is
            currently on — the bar only says it to people who can see it. */}
        <ul
          ref={tabsRef}
          className="relative flex flex-wrap items-center justify-center gap-x-8 gap-y-2 sm:gap-x-12"
        >
          {parts.map((part) => {
            const isActive = part === active;
            return (
              <li key={part}>
                <button
                  type="button"
                  data-part={part}
                  onClick={() => setActive(part)}
                  aria-pressed={isActive}
                  className={`px-1 py-2 text-tab transition-colors duration-300 ease-out focus-visible:text-white focus-visible:outline-none ${
                    isActive ? "text-white" : "text-muted hover:text-white"
                  }`}
                >
                  {part}
                </button>
              </li>
            );
          })}

          {/* Hidden until it has been measured, so it cannot animate in from
              the top-left corner on the first paint. */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 h-px bg-white transition-[transform,width,opacity] duration-300 ease-out"
            style={
              bar
                ? { transform: `translate(${bar.left}px, ${bar.top}px)`, width: bar.width, opacity: 1 }
                : { opacity: 0 }
            }
          />
        </ul>
      </Reveal>

      {/* One Reveal for the whole grid rather than one per chip: the Reveal
          is the section's own entrance and fires once, and the swap between
          parts is a different animation with a different job. */}
      <Reveal delay={beat(1, GROUP)} className="mt-block w-full">
        {/* Keyed on the part, so React replaces the chips rather than
            re-labelling them in place — which is what gives every one of
            them a mount to animate on.

            The chips keep their own height — a chip is a name in a box and
            stretching it to fill a row turned it into a placard. The section
            is filled by the space between them instead, which is why the row
            gap is so much larger than the column gap. */}
        <ul
          key={active}
          className="grid grid-cols-2 gap-x-5 gap-y-20 sm:grid-cols-3 lg:grid-cols-5"
        >
          {shown.map((member, i) => (
            <li
              key={member.id}
              className="member-in"
              /* Capped: a stagger that ran the full length of Server's
                 fifteen would take half a second longer to settle than
                 Design's two, and the tabs would feel unevenly weighted. */
              style={{ animationDelay: `${Math.min(i, 9) * 35}ms` }}
            >
              <MemberCard member={member} />
            </li>
          ))}
          {Array.from({ length: blanks }, (_, i) => (
            <li key={`slot-${i}`} aria-hidden className="invisible">
              <div className={CHIP_SHELL}>&nbsp;</div>
            </li>
          ))}
        </ul>
      </Reveal>
    </>
  );
}
