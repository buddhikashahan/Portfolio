import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Fills its positioned parent with a photo that keeps its full frame — no
 * cropping — by layering two copies of the same image: a heavily blurred one
 * scaled up to fill the box edge-to-edge, and the real image on top sized with
 * `object-contain` so nothing outside the crop box is lost. Any letterboxing
 * that `object-contain` leaves is covered by the soft blur showing through,
 * rather than an empty background colour.
 *
 * Must be rendered inside a `relative` (or otherwise positioned) parent with a
 * defined size, exactly like a normal `<Image fill>` — this only replaces the
 * single `<Image>` a cover slot used to render.
 */
export function CoverImage({
  src,
  alt = "",
  sizes,
  priority,
  hoverZoom = false,
}: {
  src: string;
  alt?: string;
  sizes: string;
  priority?: boolean;
  hoverZoom?: boolean;
}) {
  return (
    <>
      {/*
        aria-hidden removes this from the accessibility tree regardless of
        `alt`, so giving it the same text as the foreground costs nothing for
        real screen readers — it just stops SEO checkers that don't
        understand aria-hidden from flagging it as a missing alt attribute.
      */}
      <Image
        src={src}
        alt={alt}
        aria-hidden
        fill
        sizes={sizes}
        className="scale-125 object-cover blur-3xl"
      />
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={cn(
          "relative object-contain",
          hoverZoom && "transition-transform duration-500 group-hover:scale-[1.03]",
        )}
      />
    </>
  );
}
