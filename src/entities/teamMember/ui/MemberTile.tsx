import type { CSSProperties } from "react";
import type { TeamMember } from "../model/types";

/* The last two characters of the name. Korean puts the family name first, so
   the two that identify a person are the ones at the end. */
const initials = (name: string) => name.trim().slice(-2) || "?";

/* One name folded into one hue, so the same person is always the same
   colour and no two neighbours are likely to collide. */
function hueOf(seed: string): number {
  let hue = 0;
  for (let i = 0; i < seed.length; i += 1) hue = (hue * 31 + seed.charCodeAt(i)) % 360;
  return hue;
}

/* One member, as the comp draws them at node 141:4: a hairline rectangle
   holding a round avatar, the name under it, and the generation under that.
   It stays at the comp's 136px on a phone, where two tiles should still be
   legible in the rail at once. From sm up it grows to 160px, then to 192px
   on a full desktop viewport: that is where the section has the room for a
   larger portrait without trading away the sense that the row continues.

   The comp's border is solid #fff, which is a dark-background value — right
   here, since the page has no light mode, but it is still louder at 1px than
   it looks in the file, so it takes the same --color-line the rest of the
   page's hairlines take and goes to the accent when pointed at, the way
   every other link on the page does. */
export default function MemberTile({
  member,
  /* The list item's, not the tile's — the roster hangs its entrance
     animation and that tile's share of the stagger here. */
  className = "",
  style,
}: {
  member: TeamMember;
  className?: string;
  style?: CSSProperties;
}) {
  const shell =
    "member-tile flex w-[136px] snap-start flex-col items-start gap-4 border border-line p-3 sm:w-[160px] sm:p-4 lg:w-[192px] lg:p-5";

  const body = (
    <>
      {/* aspect-square rather than a fixed height: the tile is a fixed width
          today, but a height and a ratio together mean the ratio loses, and
          the circle would go oval the moment the width ever moved. */}
      <span className="grid aspect-square w-full place-items-center overflow-hidden rounded-full">
        {member.avatarUrl ? (
          /* Not next/image: thirty-three portraits from another host, used
             at one fixed size. Routing them through the optimiser would bill
             a transformation each to serve what GitHub already serves.

             width and height are attributes rather than CSS. GitHub returns
             them around 400px square, and without an intrinsic size the box
             is zero tall until the bytes land — a whole rail's height
             arriving late. */
          <img
            src={member.avatarUrl}
            alt=""
            width={112}
            height={112}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          /* Only for a member with no GitHub handle at all. Tinted from the
             name, so the same person is always the same colour. */
          <span
            aria-hidden
            style={{ "--seed-h": hueOf(member.name) } as CSSProperties}
            className="grid h-full w-full place-items-center bg-[hsl(var(--seed-h)_38%_22%)] text-[28px] font-semibold tracking-tight text-[hsl(var(--seed-h)_55%_78%)]"
          >
            {initials(member.name)}
          </span>
        )}
      </span>

      <span className="flex w-full min-w-0 flex-col gap-1">
        {/* keep-all: Korean breaks between words, not inside them. */}
        <span className="text-[16px] leading-normal font-semibold break-keep text-white">
          {member.name}
        </span>
        {member.generationLabel ? (
          <span className="text-[12px] leading-normal font-normal text-muted">
            {member.generationLabel}
          </span>
        ) : null}

        {member.link ? (
          /* Kept inside the card only where hover exists. Touch gets one
             instruction for the rail below its scroll indicator instead of
             repeating the same sentence in every tile. */
          <span
            aria-hidden
            className="member-github-hover mt-1 items-center gap-1 text-[12px] leading-normal font-medium text-accent"
          >
            깃허브로 이동 <span aria-hidden>→</span>
          </span>
        ) : (
          /* Keep cards without a profile the same height as their
             desktop neighbours without pretending there is somewhere to
             go. Mobile keeps the original card height. */
          <span aria-hidden className="member-github-empty mt-1 h-[17px]" />
        )}
      </span>
    </>
  );

  /* A tile with nowhere to go is not a link. Rendered as an anchor with an
     empty href it would still be focusable, still announced as a link, and
     would reload the page when pressed. */
  if (!member.link) {
    return (
      <li className={className} style={style}>
        <div className={shell}>{body}</div>
      </li>
    );
  }

  return (
    <li className={className} style={style}>
      <a
        href={member.link}
        target="_blank"
        rel="noopener noreferrer"
        className={`${shell} transition-colors duration-300 ease-out hover:border-accent focus-visible:border-accent focus-visible:outline-none`}
      >
        {body}
        {/* The link's own name would otherwise be a person's name and
            nothing else, which does not say where pressing it goes. */}
        <span className="sr-only">GitHub 프로필 열기</span>
      </a>
    </li>
  );
}
