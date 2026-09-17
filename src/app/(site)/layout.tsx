import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { BackgroundFX } from "@/components/layout/background-fx";
import { ScrollProgress } from "@/components/motion";
import { getProfile } from "@/lib/queries";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const profile = await getProfile();

  return (
    <div className="relative flex min-h-dvh flex-col">
      <BackgroundFX />
      <ScrollProgress />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-slate-950"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter
        email={profile?.email}
        githubUrl={profile?.githubUrl}
        linkedinUrl={profile?.linkedinUrl}
        whatsappUrl={profile?.whatsappUrl}
        twitterUrl={profile?.twitterUrl}
      />
    </div>
  );
}
