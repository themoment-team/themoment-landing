import MemberCard from "@/entities/teamMember/ui/MemberCard";
import { getTeamMembers, groupByGeneration } from "@/entities/teamMember/api/getTeamMembers";
import Reveal from "@/shared/ui/Reveal";
import RevealGroup from "@/shared/ui/RevealGroup";
import { BEAT, GROUP, beat } from "@/shared/lib/timing";

/* The team, read from Notion on the server. A server component, so the
   integration secret never leaves the machine and the visitor is sent the
   names already rendered — no spinner, no second request, nothing to
   hydrate but the cards themselves.

   Grouped by generation rather than by the part tabs the comp draws. The
   four parts are Server 15, Frontend 14, Design 2 and DevOps 2, so tabbing
   by part gives two long lists and two that barely fill a row. Generations
   cut the same people evenly, and each card carries its own part instead. */
export default async function TeamSection() {
  const members = await getTeamMembers();
  const groups = groupByGeneration(members);

  return (
    <section id="member" className="relative flex min-h-dvh w-full flex-col bg-veil scroll-mt-16">
      <RevealGroup className="mx-auto flex w-full max-w-column grow flex-col justify-center items-center px-gutter py-section">
        <Reveal as="h2" className="text-display font-bold text-white">
          Member
        </Reveal>
        <Reveal as="p" delay={BEAT} className="mt-stack text-center text-body font-medium text-white">
          <span className="text-accent">더모먼트</span>에서 순간을 혁신하고 있는
          광주소프트웨어마이스터고 각 분야, 각 기수의 최고 인재들은 누굴까요
        </Reveal>

        {groups.length === 0 ? (
          /* No key, or Notion is down. The section says so rather than
             rendering a heading over nothing — and says it in a way that
             tells whoever is running the build what to do about it. */
          <Reveal as="p" delay={GROUP} className="mt-block text-body font-medium text-muted">
            팀 정보를 불러오지 못했습니다.
          </Reveal>
        ) : (
          <div className="mt-block flex w-full flex-col gap-block">
            {groups.map((group, gi) => (
              <div key={group.key} className="w-full">
                {/* The generation, set as a heading rather than a chip: it
                    is what divides the list, and a screen reader moving by
                    heading should land on each one. */}
                <Reveal
                  as="h3"
                  delay={beat(gi, GROUP)}
                  className="mb-stack flex items-baseline gap-3 text-tab font-medium text-white"
                >
                  {group.label}
                  <span className="text-label font-medium text-muted">{group.members.length}</span>
                  <span className="h-px grow bg-line" aria-hidden />
                </Reveal>

                {/* Five across at the comp's width, and fewer as the screen
                    narrows. auto-fill rather than a fixed count, so the last
                    row of a short generation does not stretch its two cards
                    across the full width. */}
                <ul className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
                  {group.members.map((member, i) => (
                    <Reveal as="li" key={member.id} delay={beat(i % 5, gi * GROUP + BEAT)}>
                      <MemberCard member={member} />
                    </Reveal>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </RevealGroup>
    </section>
  );
}
