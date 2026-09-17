/**
 * Fixed backdrop: a fine hairline grid that fades out below the fold, plus one
 * soft accent halo behind the hero.
 *
 * The previous version used three saturated drifting orbs. A single low-opacity
 * halo reads as considered rather than decorative, and keeps contrast ratios
 * predictable for the text sitting on top of it.
 */
export function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="grid-backdrop absolute inset-0"
        style={{
          maskImage:
            "radial-gradient(ellipse 100% 60% at 50% 0%, #000 30%, transparent 85%)",
        }}
      />
      <div
        className="absolute -top-64 left-1/2 h-144 w-6xl -translate-x-1/2 rounded-full blur-[120px]"
        style={{ background: "var(--halo)" }}
      />
    </div>
  );
}
