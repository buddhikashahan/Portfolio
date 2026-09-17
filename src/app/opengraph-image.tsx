import { ImageResponse } from "next/og";

import { getProfile } from "@/lib/queries";
import { siteConfig } from "@/lib/site-config";

export const alt = `${siteConfig.name} — Full-Stack Developer`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default social preview for every page that does not set its own. Prerendered
 * from the profile; saving the profile in the dashboard revalidates it, so link
 * previews pick up a new name or headline without a redeploy.
 */
export default async function OpenGraphImage() {
  const profile = await getProfile();
  const name = profile?.fullName ?? siteConfig.name;
  const headline = profile?.headline ?? "Full-Stack Developer";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#09090b",
          backgroundImage:
            "radial-gradient(circle at 20% 0%, rgba(96,165,250,0.22), transparent 55%)",
          color: "#fafafa",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              background: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 700,
            }}
          >
            B
          </div>
          <div style={{ display: "flex", fontSize: 32, fontWeight: 600 }}>
            {siteConfig.shortName}
            <span style={{ color: "#60a5fa" }}>.dev</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05 }}>
            {name}
          </div>
          <div style={{ fontSize: 34, color: "#a1a1aa" }}>{headline}</div>
        </div>

        <div style={{ display: "flex", fontSize: 26, color: "#71717a" }}>{siteConfig.domain}</div>
      </div>
    ),
    size,
  );
}
