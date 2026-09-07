"use client";

import { useEffect, useRef, useState } from "react";
import type { PartGroup } from "@/entities/teamMember/model/parts";
import MemberTile from "@/entities/teamMember/ui/MemberTile";
import Reveal from "@/shared/ui/Reveal";
import { GROUP, beat } from "@/shared/lib/timing";
import MemberRail from "./MemberRail";

/* One part at a time, chosen from the row of tabs above — the comp's own
   structure. The generation rides on each tile instead, which is what lets
   the list be cut by part and still say which year someone is from.

   The chosen part is one line that scrolls sideways rather than a grid that
   wraps. Which is also what retires the empty cells this used to carry:
   fifteen people wrapped to three rows and two to one, so every tab had to
   lay out the same number of cells and leave the extras blank or the section
   would jump two rows deep on every press. A rail is one row whatever is in
   it. */
export default function MemberRoster({ groups }: { groups: PartGroup[] }) {
  const [active, setActive] = useState(groups[0]?.part ?? "");
  const shown = groups.find((group) => group.part === active) ?? groups[0];

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

  if (!shown) return null;

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
          {groups.map((group) => {
            const isActive = group.part === active;
            return (
              <li key={group.part}>
                <button
                  type="button"
                  data-part={group.part}
                  onClick={() => setActive(group.part)}
                  aria-pressed={isActive}
                  className={`px-1 py-2 text-tab transition-colors duration-300 ease-out focus-visible:text-white focus-visible:outline-none ${
                    isActive ? "text-white" : "text-muted hover:text-white"
                  }`}
                >
                  {group.part}
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

      {/* One Reveal for the whole rail rather than one per tile: the Reveal
          is the section's own entrance and fires once, and the swap between
          parts is a different animation with a different job. */}
      <Reveal delay={beat(1, GROUP)} className="mt-block w-full">
        {/* Keyed on the part, so React replaces the rail rather than
            re-labelling the tiles in place. Which gives every tile a mount
            to animate on, and gives the rail a fresh measurement and a
            scroll position back at the start for the part just chosen. */}
        <MemberRail
          key={active}
          label={`${shown.part} 멤버 ${shown.members.length}명`}
          mobileHint={shown.members.some((member) => member.link) ? "클릭하여 깃허브 이동" : undefined}
        >
          {shown.members.map((member, i) => (
            <MemberTile
              key={member.id}
              member={member}
              className="member-in"
              /* Capped: a stagger that ran the full length of Server's
                 fifteen would take half a second longer to settle than
                 Design's two, and the tabs would feel unevenly weighted. */
              style={{ animationDelay: `${Math.min(i, 9) * 35}ms` }}
            />
          ))}
        </MemberRail>
      </Reveal>
    </>
  );
}
