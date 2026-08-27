import Reveal from "./Reveal";
import RevealGroup from "./RevealGroup";
import { BEAT, GROUP, beat } from "../lib/timing";

/* Read as one column, top to bottom: heading, who we are, then what that
   means. It was a two-column split with the name on the left and the copy
   on the right, which made the reader start again halfway across the page
   and left the short side sitting in the tall side's whitespace. */
const PHILOSOPHY = [
  {
    line: "더모먼트팀은 광주소프트웨어마이스터고등학교의 전공 동아리입니다. 약 30명의 재학생, 졸업생들이 모여서 활동하고, 주로 학교에 필요한 서비스를 개발합니다.",
  },
  { line: "작은 불편도 그냥 지나치지 않습니다. 불편을 마주하는 매 순간을 다시 설계합니다." },
  /* The close names the team, so the name is set the way the name is set
     everywhere else on the page rather than left as running text. */
  {
    line: "순간을 혁신하고 싶나요? ",
    mark: "더모먼트",
    tail: " 팀과 함께하세요.",
  },
];

export default function Intro() {
  return (
    <section id="about" className="relative bg-white w-full overflow-hidden">
      {/* The hero's whole join lives here: the hero has no bottom padding to
          give, so this padding is the entire gap between the wordmark and
          this section. See --spacing-seam for why it is shorter than the
          page's other joins rather than equal to them. */}
      <RevealGroup className="relative px-gutter pt-seam pb-section">
        {/* Who the team is, stacked: the school and the standing above the
            name, the name carrying the section on its own.

            The name takes the display size the other sections give their
            headings, because with no h2 above it that is what it is — this
            section's heading. The line over it is its standfirst. */}
        <div>
          <Reveal as="p" className="font-bold text-[#292b2f] text-lead">
            광주소프트웨어마이스터고 학생 개발팀
          </Reveal>
          <Reveal
            as="p"
            delay={BEAT}
            className="font-bold text-[#4A80F8] text-display"
          >
            더모먼트
          </Reveal>
        </div>

        {/* Run to the gutters, and set at the lead size to carry the width.

            One sentence a line, with nothing breaking it early. The copy used
            to carry its own breaks mid-sentence, which held every line to
            532px of a 1145px measure however wide the box was — the box
            filled the width and the words did not. Where a line still has to
            wrap, on a narrow screen, it now wraps at the edge it is given
            rather than at an edge chosen for a desktop. */}
        <div className="font-normal text-[#292b2f] text-subtitle mt-stack">
          {PHILOSOPHY.map((block, i) => (
            <Reveal
              as="p"
              key={i}
              delay={beat(i, GROUP)}
              className="mb-4 last:mb-0"
            >
              {block.line}
              {block.mark ? (
                <span className="font-bold text-[#4A80F8]">{block.mark}</span>
              ) : null}
              {block.tail}
            </Reveal>
          ))}
        </div>

        {/* Closes the section off, the way the reference does. It is the one
            rule on the page, so it stays quiet. */}
        <Reveal
          aria-hidden
          delay={beat(PHILOSOPHY.length, GROUP)}
          className="w-full border-t border-[#d9d9d9] mt-stack"
        />
      </RevealGroup>
    </section>
  );
}
