import type { TeamMember } from "../model/types";

/* One member, as the comp draws them: a hairline rectangle with a name in
   it. No avatar and no part — the comp has neither, and thirty-three GitHub
   avatars were thirty-three requests to another host for decoration. The
   generation follows the name, set quieter than it, so a chip still says
   which year it belongs to when the list is cut by part.

   Hovering adds where the chip goes, to the right of the name rather than
   over it: the name is what the reader was looking at and has no reason to
   leave. The label is positioned rather than laid out, so it reserves no
   width and the row does not shift as the pointer crosses it. */
/* Exported so the roster can reserve a chip's worth of space with an empty
   one, and have it come out exactly the same height. */
export const CHIP_SHELL =
  "relative flex w-full items-center border border-white p-3 text-label font-medium";

export default function MemberCard({ member }: { member: TeamMember }) {
  const shell = CHIP_SHELL;

  const name = (
    <span className="truncate text-white">
      {member.name}
      {member.generationLabel ? (
        <span className="text-muted"> {member.generationLabel}</span>
      ) : null}
    </span>
  );

  /* A chip with nowhere to go is not a link. Rendered as an anchor with an
     empty href it would still be focusable, still announced as a link, and
     would reload the page when pressed. */
  if (!member.link) {
    return <div className={shell}>{name}</div>;
  }

  return (
    <a
      href={member.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`${shell} group overflow-hidden transition-colors duration-300 ease-out hover:border-accent focus-visible:border-accent focus-visible:outline-none`}
    >
      {name}

      {/* Decoration: it says the same thing the link already says, so a
          screen reader hearing it twice would learn nothing.

          Hidden below sm — there is no hover on a phone, and at two columns
          the chip has no room for a second label anyway. It arrives from
          slightly right of where it lands, which is the same direction the
          arrow points. */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-3 hidden translate-x-1 items-center gap-1.5 whitespace-nowrap text-accent opacity-0 transition-[opacity,transform] duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 sm:flex"
      >
        깃허브로 이동
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M1 9L9 1M9 1H3.5M9 1V6.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <span className="sr-only">GitHub 프로필 열기</span>
    </a>
  );
}
