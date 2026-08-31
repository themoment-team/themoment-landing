/* The page's close. Built from the reference the team supplied, minus the
   oversized THE MOMENT watermark that sat across the middle of it.

   A lifted surface rather than the page's own ink: it is the one band that
   is not the starfield, which is what makes it read as the end of the page
   rather than one more section of it. Opaque, so the particle canvas fixed
   behind the document does not show through and keep moving down here. */

const SOCIAL = [{ label: "Instagram", href: "https://www.instagram.com/team.the_moment/" }];

const linkClass =
  "text-body font-medium text-muted transition-colors duration-300 ease-out hover:text-white focus-visible:text-white focus-visible:outline-none";

function Column({
  title,
  items,
}: {
  title: string;
  items: { label: string; href?: string }[];
}) {
  return (
    <div className="min-w-[120px]">
      <h2 className="text-label font-bold tracking-wide text-white">{title}</h2>
      <ul className="mt-4 flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.label}>
            {item.href ? (
              <a href={item.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {item.label}
              </a>
            ) : (
              <span className="text-body font-medium text-muted">{item.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  /* The page revalidates hourly, so this is never more than an hour stale —
     which is what makes computing it safer than typing a year that will be
     wrong on a January morning and noticed by nobody. */
  const year = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-surface px-gutter py-block">
      <div className="flex w-full flex-col gap-block sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-label font-bold tracking-wide text-white">THE MOMENT</p>
          <p className="mt-4 text-body font-medium text-muted">
            A development partner innovating <span className="text-accent">the moment</span>.
          </p>
        </div>

        <div className="flex gap-12 sm:gap-16">
          <Column title="SOCIAL" items={SOCIAL} />
        </div>
      </div>

      <p className="mt-block text-label font-medium text-muted">
        © {year} <span className="text-accent">the_moment</span>. All rights reserved.
      </p>
    </footer>
  );
}
