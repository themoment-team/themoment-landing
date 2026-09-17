/* Wait for an image to be fetched and decoded, not merely present in the
   browser cache. A decoded image can be painted on the first frame after the
   intro lifts instead of briefly showing its transparent placeholder. */
const IMAGE_WAIT_CAP = 15000;

function waitForImage(image: HTMLImageElement): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(cap);
      image.removeEventListener("load", decode);
      image.removeEventListener("error", finish);
      resolve();
    };

    const decode = () => {
      if (typeof image.decode !== "function") {
        finish();
        return;
      }

      void image.decode().catch(() => undefined).then(finish);
    };

    /* A single missing remote avatar must not leave the site permanently
       black. Successful images normally settle far earlier; this only closes
       stalled or failed requests. */
    const cap = window.setTimeout(finish, IMAGE_WAIT_CAP);

    if (image.complete) {
      if (image.naturalWidth > 0) decode();
      else finish();
      return;
    }

    image.addEventListener("load", decode, { once: true });
    image.addEventListener("error", finish, { once: true });
  });
}

function absoluteSource(source: string): string {
  try {
    return new URL(source, window.location.href).href;
  } catch {
    return source;
  }
}

/* Whether an image is on screen at the moment the cover would lift, which
   is the only moment this function exists to protect. The page has not been
   scrolled yet when this runs, so the first viewport is the whole of what a
   visitor can see. Zero-width images are excluded: an <img> in a collapsed
   or not-yet-laid-out box is not something anyone is about to look at. */
function isInFirstViewport(image: HTMLImageElement): boolean {
  const rect = image.getBoundingClientRect();
  return rect.width > 0 && rect.top < window.innerHeight && rect.bottom > 0;
}

/**
 * Holds the opening until everything visible behind the cover has decoded.
 *
 * It used to hold for every image on the page — four 3840x2160 project
 * stills and thirty-three remote avatars — and the particle field is not
 * even mounted until this settles, so the hero, which is the largest thing
 * the first screen paints, could not begin drawing until the last avatar
 * came back from GitHub. That is Largest Contentful Paint measured in
 * whole seconds, on a screen whose content is a canvas and some type.
 *
 * None of that work bought anything. Every one of those images is a screen
 * or more below the fold; by the time a visitor has scrolled to the member
 * rail the browser has had seconds to fetch it on its own, which is what
 * `loading="lazy"` is already asking it to do. So the wait is now only for
 * what is actually on screen, and the rest is left to load the ordinary way
 * — later, and out of the hero's way.
 *
 * The avatars that used to be passed in here are fetched by warmImages
 * instead, once the opening is over and there is nothing left to hold.
 */
export async function preloadImages(): Promise<void> {
  const visible = Array.from(document.images).filter(isInFirstViewport);

  /* Only for the ones being waited on. Forcing the rest eager — which is
     what this used to do to every image on the page — puts thirty-odd
     requests in front of the hero's own work for no benefit. */
  for (const image of visible) image.loading = "eager";

  await Promise.all(visible.map(waitForImage));
}

/**
 * Fetches everything below the fold into the browser cache, after the fact.
 *
 * The rails scroll sideways, so a tile three positions along is off screen
 * and stays off screen until a finger moves it — at which point a lazy
 * image starts its request and the portrait arrives visibly late. Preloading
 * is the right answer to that. It was only ever in the wrong place: ahead of
 * the first paint, where it held the hero, rather than after the opening,
 * where there is nothing left to hold.
 *
 * Nothing awaits this and nothing renders differently for it. Every request
 * goes out at low priority, so it fills the gap the page leaves behind it
 * rather than competing with anything the visitor is looking at.
 */
export function warmImages(sources: readonly string[] = []): void {
  const wanted = new Set(
    [...Array.from(document.images).map((image) => image.currentSrc || image.src), ...sources]
      .filter(Boolean)
      .map(absoluteSource),
  );

  for (const source of wanted) {
    const image = new Image();
    image.decoding = "async";
    image.fetchPriority = "low";
    image.src = source;
  }
}
