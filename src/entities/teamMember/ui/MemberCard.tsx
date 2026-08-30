"use client";

import { useState } from "react";
import type { TeamMember } from "../model/types";

/* Korean names have no whitespace to take initials from, and the first
   character is the family name — a wall of 이, 김, 박 tells you nothing
   about who is who. The given name is the distinguishing half, so that is
   what is drawn. Latin names fall back to the usual first letters. */
function initials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length > 1) return words.slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return name.length <= 2 ? name : name.slice(-2);
}

/* One member. A glass plate over the dark: a hairline, a barely-there fill,
   and a blur behind it, all of which come up when the card is pointed at.

   A plain <img> rather than next/image. These are 400px GitHub avatars from
   a host the optimiser would have to be told about, thirty-odd of them on
   one screen, and the one thing they need — a fallback when the account
   turns out not to exist — is a plain onError. */
export default function MemberCard({ member }: { member: TeamMember }) {
  const [src, setSrc] = useState(member.avatarUrl);
  const githubAvatar = member.githubId ? `https://github.com/${member.githubId}.png` : "";

  /* github.com/{id}.png draws an identicon for any account that never
     uploaded a picture, so a 404 means the account does not exist rather
     than that they have no photo. A picture the database pointed at can
     also have gone — a Notion upload is a signed URL that expires in about
     an hour. Either way: try GitHub, then give up and draw initials. */
  const handleError = () => {
    if (githubAvatar && src !== githubAvatar) setSrc(githubAvatar);
    else setSrc("");
  };

  const body = (
    <>
      <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-glass">
        {src ? (
          <img
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
            onError={handleError}
            className="size-full object-cover"
          />
        ) : (
          <span aria-hidden className="text-label font-medium text-muted">
            {initials(member.name)}
          </span>
        )}
      </span>

      <span className="flex min-w-0 flex-col">
        <span className="truncate text-label font-medium text-white">{member.name}</span>
        {member.role ? (
          <span className="truncate text-[12px] leading-[1.4] font-medium text-muted transition-colors duration-500 ease-out group-hover:text-accent">
            {member.role}
          </span>
        ) : null}
      </span>
    </>
  );

  const shell =
    "group flex items-center gap-3 rounded-xl border border-line bg-glass p-3 " +
    "backdrop-blur-sm transition-[background-color,border-color,transform] duration-500 ease-out";

  /* A card with nowhere to go is not a link. Rendered as an anchor with an
     empty href it would still be focusable, still announced as a link, and
     would reload the page when pressed. */
  if (!member.link) {
    return <div className={shell}>{body}</div>;
  }

  return (
    <a
      href={member.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`${shell} hover:-translate-y-0.5 hover:border-line-strong hover:bg-glass-lit focus-visible:border-line-strong focus-visible:bg-glass-lit focus-visible:outline-none`}
    >
      {body}
      <span className="sr-only">GitHub 프로필 열기</span>
    </a>
  );
}
