'use client';

import { useEffect, useRef } from 'react';
import { INTRO } from '@/shared/lib/timing';
import styles from './IntroOverlay.module.css';

/* The opening. Black covers the screen, the mark draws itself out of three
   arcs and an M, the wordmark rises a letter at a time, and then the whole
   lockup shrinks to the top of the screen as the cover lifts off the hero.
   About three and a half seconds, and it plays on every visit.

   Docked, this IS the site's top logo — the hero no longer draws one of its
   own, or there would be two in the same place. It is fixed rather than in
   flow, and fades out over the first 160px of scroll.

   The SVG ids here (tm-grad, tm-mk-*) are global. Rendering this twice on
   one screen would have the masks overwrite each other; it is a singleton. */

/** When the drawing ends and the logo starts up to the top, in ms. Must
 *  match the tmDock delay in the stylesheet. Shared, because the particle
 *  field behind the page waits on the same clock. */
const DOCK_AT = INTRO.dockAt;
/** Scroll this far and the docked logo is gone. */
const FADE_END = 160;

const WORDMARK = 'the_moment';

export default function IntroOverlay({ start }: { start: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let docked = false;
    let ticking = false;

    /** The intro plays on every visit, which it cannot do from halfway down
     *  the page: a browser restoring the previous scroll position lands with
     *  scrollY above the threshold below, and the opening is finished before
     *  it is seen. This is the whole of the landing, so there is no reading
     *  position worth restoring anyway. */
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    /** Measure the overlay and work out the exact docking distance. The CSS
     *  fallback, calc(-50vh + var(--dock-y)), is a few pixels out wherever a
     *  mobile address bar makes vh disagree with the real viewport. */
    const setDockDistance = () => {
      const h = el.getBoundingClientRect().height;
      const dockY = parseFloat(getComputedStyle(el).getPropertyValue('--dock-y')) || 64;
      el.style.setProperty('--dock-dy', `${dockY - h / 2}px`);
    };

    /** Scrolling during the intro sends it straight to the end rather than
     *  making the visitor wait. Finishing the running animations, rather
     *  than swapping the class off, is what stops a half-drawn mark being
     *  left behind. */
    const finishNow = () => {
      /* Nothing to finish before the opening has started, and the only
         animation running then is the black hold — ending that early would
         skip the opening rather than skip ahead in it. */
      if (!start || docked) return;
      docked = true;
      el.getAnimations({ subtree: true }).forEach((a) => {
        try { a.finish(); } catch { /* nothing here repeats forever */ }
      });
    };

    const applyFade = () => {
      const y = window.scrollY || 0;
      if (!docked && y > 4) finishNow();
      const f = 1 - Math.min(1, Math.max(0, y / FADE_END));
      el.style.setProperty('--fade', f.toFixed(3));
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(applyFade);
      }
    };

    setDockDistance();
    applyFade();

    /* Measured from the moment the opening actually starts, not from mount:
       it waits on the field behind it, so the two are not the same instant. */
    const timer = start
      ? window.setTimeout(() => { docked = true; }, DOCK_AT + 950)
      : 0;
    window.addEventListener('resize', setDockDistance);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', setDockDistance);
      window.removeEventListener('scroll', onScroll);
    };
  }, [start]);

  return (
    // .run ships in the server markup, so the opening starts on the first
    // paint instead of waiting for hydration
    <div
      ref={ref}
      className={`${styles.intro} ${start ? styles.run : styles.holding}`}
      aria-hidden="true"
    >
      <div className={styles.veil} />

      <div className={styles.lockup}>
        <svg className={styles.mark} viewBox="0 0 192 192" role="img" aria-label="더모먼트 로고">
          <defs>
            <radialGradient
              id="tm-grad"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(95.5751 96.419) rotate(90) scale(50.5748 50.5748)"
            >
              <stop stopColor="#2438F8" />
              <stop offset="0.296875" stopColor="#6A76E9" />
              <stop offset="1" stopColor="#6A76E9" stopOpacity="0" />
            </radialGradient>

            {/* Each mask is a stroke wiping across the real shape, so the last
                frame is the original logo to the pixel. Do not edit the paths. */}
            <mask id="tm-mk-ring" maskUnits="userSpaceOnUse" x="0" y="0" width="192" height="192">
              <path
                className={`${styles.wipe} ${styles.wRing}`}
                pathLength={1}
                fill="none"
                stroke="#fff"
                strokeWidth="13"
                d="M97.551 51.173 A45.289 45.289 0 0 0 63.551 128.443 A45.289 45.289 0 0 0 140.821 94.443"
              />
            </mask>
            <mask id="tm-mk-main" maskUnits="userSpaceOnUse" x="0" y="0" width="192" height="192">
              <path
                className={`${styles.wipe} ${styles.wMain}`}
                pathLength={1}
                fill="none"
                stroke="#fff"
                strokeWidth="8"
                d="M65.809 88.942 A30.69 30.69 0 0 1 116.309 73.792 A30.69 30.69 0 0 1 105.618 125.419"
              />
            </mask>
            <mask id="tm-mk-tick" maskUnits="userSpaceOnUse" x="0" y="0" width="192" height="192">
              <path
                className={`${styles.wipe} ${styles.wTick}`}
                pathLength={1}
                fill="none"
                stroke="#fff"
                strokeWidth="5"
                d="M66.326 96.674 A29.25 29.25 0 0 0 95.320 125.668"
              />
            </mask>
          </defs>

          <rect x="28" y="28" width="136" height="136" rx="48" fill="#fff" />

          {/* outer ring */}
          <path
            mask="url(#tm-mk-ring)"
            fill="url(#tm-grad)"
            d="M95.5747 56.4155C87.6631 56.4156 79.9294 58.7623 73.3511 63.1577C66.7728 67.5532 61.6454 73.8005 58.6177 81.1099C55.5899 88.4194 54.7978 96.4633 56.3413 104.223C57.8849 111.983 61.6941 119.111 67.2886 124.706C72.8831 130.3 80.0112 134.109 87.771 135.653C95.5307 137.196 103.574 136.404 110.883 133.376C118.193 130.349 124.441 125.222 128.836 118.643C133.232 112.065 135.578 104.33 135.578 96.4185H146.15C146.15 106.421 143.184 116.2 137.626 124.517C132.069 132.834 124.17 139.316 114.929 143.144C105.688 146.972 95.519 147.973 85.7085 146.022C75.898 144.071 66.886 139.254 59.813 132.181C52.74 125.108 47.9236 116.096 45.9722 106.286C44.0207 96.4752 45.0223 86.3062 48.8501 77.0649C52.678 67.8236 59.16 59.924 67.477 54.3667C75.7939 48.8096 85.5721 45.8443 95.5747 45.8442V56.4155Z"
          />
          {/* main arc */}
          <path
            mask="url(#tm-mk-main)"
            fill="url(#tm-grad)"
            d="M86.353 64.1362C92.0135 62.5195 98.0001 62.4195 103.711 63.8462C109.423 65.273 114.659 68.1763 118.894 72.2651C123.129 76.354 126.215 81.4853 127.841 87.1431C129.468 92.8008 129.578 98.7866 128.162 104.5C126.745 110.214 123.85 115.455 119.769 119.698C116.355 123.246 112.211 125.991 107.638 127.752C106.153 128.324 104.55 127.432 104.107 125.904C103.664 124.375 104.553 122.79 106.028 122.192C109.634 120.729 112.903 118.521 115.616 115.702C118.996 112.188 121.394 107.847 122.568 103.114C123.741 98.3808 123.65 93.4222 122.302 88.7358C120.955 84.0494 118.398 79.7995 114.89 76.4126C111.382 73.0257 107.045 70.6208 102.314 69.439C97.5831 68.2571 92.6248 68.34 87.936 69.6792C83.2472 71.0184 78.9922 73.5666 75.5991 77.0688C72.8766 79.879 70.7857 83.2242 69.4507 86.8794C68.9047 88.3744 67.3525 89.3175 65.8091 88.9292C64.2657 88.5408 63.3174 86.9697 63.8364 85.4653C65.4355 80.833 68.0333 76.5945 71.4595 73.0581C75.5558 68.83 80.6924 65.753 86.353 64.1362Z"
          />
          {/* thin arc */}
          <path
            mask="url(#tm-mk-tick)"
            fill="url(#tm-grad)"
            d="M64.8833 96.4146C66.4748 96.4146 67.7498 97.7086 67.9145 99.2915C68.1917 101.957 68.8531 104.573 69.8823 107.058C71.28 110.432 73.3282 113.498 75.9106 116.081C78.4931 118.663 81.559 120.711 84.9331 122.109C87.4179 123.138 90.0346 123.799 92.6997 124.077C94.2827 124.241 95.5766 125.516 95.5767 127.108C95.5767 128.7 94.2835 130.003 92.6977 129.867C89.2751 129.572 85.9123 128.753 82.728 127.434C78.6545 125.747 74.9532 123.273 71.8354 120.156C68.7177 117.038 66.2444 113.337 64.5571 109.263C63.2382 106.079 62.419 102.716 62.1245 99.2935C61.9881 97.7077 63.2917 96.4146 64.8833 96.4146Z"
          />
          {/* the M — outlined first, then the fill lands */}
          <path
            className={styles.mFill}
            fill="url(#tm-grad)"
            d="M95.814 96.3999L102.414 85.314H108.187L108.247 106.146H101.848L101.797 96.6431L97.2651 104.271H94.1704L89.647 96.9722V106.146H83.2485V85.314H89.022L95.814 96.3999Z"
          />
          <path
            className={styles.mLine}
            pathLength={1}
            fill="none"
            stroke="url(#tm-grad)"
            strokeWidth="1.5"
            strokeDasharray="1"
            strokeLinejoin="round"
            d="M95.814 96.3999L102.414 85.314H108.187L108.247 106.146H101.848L101.797 96.6431L97.2651 104.271H94.1704L89.647 96.9722V106.146H83.2485V85.314H89.022L95.814 96.3999Z"
          />
          {/* the spark riding the head of the arc as it draws */}
          <circle className={styles.head} cx="0" cy="0" r="2.3" fill="#2438F8" />
        </svg>

        <p className={styles.word}>
          {WORDMARK.split('').map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </p>
      </div>
    </div>
  );
}
