type Router = { push: (href: string) => void };
type DocWithVT = Document & { startViewTransition?: (update: () => Promise<void>) => unknown };

/** Name shared by a trip card's photo and the trip page's hero photo. */
export const TRIP_HERO_VT = "trip-hero";

/**
 * Opens a trip page so the tapped card's photo grows into the page's hero photo
 * (View Transitions API). Browsers without it, and reduced-motion visitors, get a
 * normal navigation. The transition waits for the new hero to render (up to 2 s).
 */
export function openTripWithTransition(router: Router, slug: string, photo: HTMLElement | null) {
  const href = `/trips/${slug}`;
  const doc = document as DocWithVT;
  if (!doc.startViewTransition || !photo || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    router.push(href);
    return;
  }
  // Only one element may carry the name in each snapshot: free it on a current hero.
  document.querySelectorAll<HTMLElement>("[data-trip-hero]").forEach((el) => (el.style.viewTransitionName = "none"));
  photo.style.viewTransitionName = TRIP_HERO_VT;

  doc.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        router.push(href);
        const started = performance.now();
        const wait = () => {
          const ready = document.querySelector(`[data-trip-hero="${CSS.escape(slug)}"]`);
          if (ready || performance.now() - started > 2000) {
            photo.style.viewTransitionName = "";
            resolve();
          } else {
            // Timers, not animation frames: rendering is paused during the update callback.
            window.setTimeout(wait, 16);
          }
        };
        window.setTimeout(wait, 16);
      })
  );
}

/** True for a plain left click that should be handled in-app (no new tab/window). */
export function isPlainClick(e: { button: number; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean }) {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}
