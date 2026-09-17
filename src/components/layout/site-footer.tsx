import Link from "next/link";
import { Mail } from "lucide-react";

import { GithubIcon, LinkedinIcon, WhatsappIcon, XIcon } from "@/components/ui/brand-icons";

import { Container } from "@/components/ui/section";
import { mainNav, siteConfig } from "@/lib/site-config";

type FooterProps = {
  email?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  whatsappUrl?: string | null;
  twitterUrl?: string | null;
};

export function SiteFooter({
  email,
  githubUrl,
  linkedinUrl,
  whatsappUrl,
  twitterUrl,
}: FooterProps) {
  const socials = [
    githubUrl && { href: githubUrl, label: "GitHub", Icon: GithubIcon },
    linkedinUrl && { href: linkedinUrl, label: "LinkedIn", Icon: LinkedinIcon },
    twitterUrl && { href: twitterUrl, label: "X", Icon: XIcon },
    whatsappUrl && { href: whatsappUrl, label: "WhatsApp", Icon: WhatsappIcon },
    email && { href: `mailto:${email}`, label: "Email", Icon: Mail },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof Mail }[];

  return (
    <footer className="mt-24 border-t border-hairline bg-surface-sunken/40">
      <Container className="py-12">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center">
              <span className="text-[0.95rem] font-semibold tracking-tight text-ink">
                {siteConfig.shortName}
                <span className="text-accent">.dev</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-ink-muted">
              Full-stack developer building web, mobile and AI-powered products.
              Currently taking on freelance work.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <h2 className="text-xs font-semibold tracking-[0.18em] text-ink uppercase">
                Site
              </h2>
              <ul className="mt-4 space-y-2.5">
                {mainNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-ink-muted transition hover:text-accent"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xs font-semibold tracking-[0.18em] text-ink uppercase">
                Elsewhere
              </h2>
              <ul className="mt-4 space-y-2.5">
                {socials.map(({ href, label }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      className="text-sm text-ink-muted transition hover:text-accent"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h2 className="text-xs font-semibold tracking-[0.18em] text-ink uppercase">
                Get in touch
              </h2>
              {email ? (
                <a
                  href={`mailto:${email}`}
                  className="mt-4 block text-sm text-ink-muted transition hover:text-accent"
                >
                  {email}
                </a>
              ) : null}
              <div className="mt-4 flex gap-2">
                {socials.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    aria-label={label}
                    className="inline-grid size-9 place-items-center rounded-lg border border-hairline bg-surface text-ink-muted transition hover:border-accent/40 hover:text-accent"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-hairline pt-6 text-xs text-ink-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p>
            Built with Next.js, Tailwind CSS and Framer Motion.
          </p>
        </div>
      </Container>
    </footer>
  );
}
