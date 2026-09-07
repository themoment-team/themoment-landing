import { groupByPart } from "@/entities/teamMember/model/parts";
import type { TeamMember } from "@/entities/teamMember/model/types";
import Reveal from "@/shared/ui/Reveal";
import RevealGroup from "@/shared/ui/RevealGroup";
import { BEAT, GROUP } from "@/shared/lib/timing";
import MemberRoster from "./MemberRoster";

/* The team, read on the server. A server component, so the integration
   secret never leaves the machine and the visitor is sent the names already
   rendered — only the rails hydrate, for the arrows and the fades.

   One section per part, stacked, each a single line that scrolls sideways.
   That is a reversal: the section used to be a row of tabs with one part
   showing at a time, which meant thirty-one of thirty-three people were
   behind a press. Four rails show every part at once and cost a sideways
   scroll on the two long ones. The generation stays on the tile, under the
   name, which is what lets the cut be by part and still say which year
   someone is from. */
export default function TeamSection({ members }: { members: TeamMember[] }) {
  const parts = groupByPart(members);

  return (
    <section id="member" className="relative flex min-h-dvh w-full flex-col bg-veil">
      {/* Deeper below than above. The roster ends on a rail with nothing
          under it to close the section off, so the same padding top and
          bottom reads as the page running out rather than the section
          ending. Built from the two steps rather than typed as a number, so
          it still tracks the scale on a narrow screen. */}
      <RevealGroup className="mx-auto flex w-full grow flex-col items-center justify-center px-gutter pt-roomy pb-[calc(var(--spacing-roomy)_+_var(--spacing-block))]">
        <Reveal as="h2" className="text-display font-bold text-white">
          Member
        </Reveal>
        <Reveal as="p" delay={BEAT} className="mt-stack text-center text-body font-medium text-white">
          <span className="text-accent">더모먼트</span>에서 순간을 혁신하고 있는
          광주소프트웨어마이스터고 각 분야, 각 기수의 최고 인재들은 누굴까요
        </Reveal>

        <div className="mt-block flex w-full flex-col items-center">
          {parts.length === 0 ? (
            /* Neither the roster nor Notion produced anyone, which should not
               happen — the roster is committed. Say so rather than render a
               row of tabs over nothing. */
            <Reveal as="p" delay={GROUP} className="text-body font-medium text-muted">
              팀 정보를 불러오지 못했습니다.
            </Reveal>
          ) : (
            <MemberRoster groups={parts} />
          )}
        </div>
      </RevealGroup>
    </section>
  );
}
