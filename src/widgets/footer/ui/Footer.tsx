/* The page's close. Built from the reference the team supplied, minus the
   oversized THE MOMENT watermark that sat across the middle of it.

   A lifted surface rather than the page's own ink: it is the one band that
   is not the starfield, which is what makes it read as the end of the page
   rather than one more section of it. Opaque, so the particle canvas fixed
   behind the document does not show through and keep moving down here.

   What is left is a name on the left, and the copyright with the one place
   to find us after it on the right: a band about six percent of the viewport
   tall. The link is underlined and white rather than muted, because it is
   the only thing down here that can be clicked and nothing else in the band
   says so. On a short viewport the padding is the taller of the two and sets
   the height instead. Below sm it stacks and neither one binds. */

const SOCIAL = [{ label: "Instagram", href: "https://www.instagram.com/team.the_moment/" }];

const linkClass =
  "text-label font-medium text-white underline underline-offset-4 transition-colors duration-300 ease-out hover:text-accent focus-visible:text-accent focus-visible:outline-none";

export default function Footer() {
  /* The page revalidates hourly, so this is never more than an hour stale —
     which is what makes computing it safer than typing a year that will be
     wrong on a January morning and noticed by nobody. */
  const year = new Date().getFullYear();

  return (
    <footer className="relative flex min-h-[6vh] w-full items-center bg-surface px-gutter py-4">
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <p className="text-label font-bold tracking-wide text-white">THE MOMENT</p>

        <div className="flex items-center gap-6">
          <p className="text-label font-medium text-muted">
            © {year} <span className="text-accent">the_moment</span>. All rights reserved.
          </p>
          {SOCIAL.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
