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

/**
 * Eagerly loads every image currently rendered on the landing page, plus
 * sources for content that is mounted only after interaction (the inactive
 * member tabs). The promise settles after each image has decoded or failed.
 */
export async function preloadImages(extraSources: readonly string[] = []): Promise<void> {
  const rendered = Array.from(document.images);

  /* Native lazy loading would otherwise leave below-the-fold work and member
     images untouched until after the intro. */
  for (const image of rendered) image.loading = "eager";

  const renderedSources = new Set(
    rendered
      .map((image) => image.currentSrc || image.src)
      .filter(Boolean)
      .map(absoluteSource),
  );

  const hiddenSources = Array.from(
    new Set(extraSources.filter(Boolean).map(absoluteSource)),
  ).filter((source) => !renderedSources.has(source));

  const hidden = hiddenSources.map((source) => {
    const image = new Image();
    image.decoding = "async";
    const ready = waitForImage(image);
    image.src = source;
    return ready;
  });

  await Promise.all([...rendered.map(waitForImage), ...hidden]);
}
