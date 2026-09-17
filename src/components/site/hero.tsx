import Image from "next/image";
import { ArrowRight, Mail, MapPin } from "lucide-react";

import { GithubIcon, LinkedinIcon, WhatsappIcon, XIcon } from "@/components/ui/brand-icons";
import { Reveal, Stagger, StaggerItem, Typewriter } from "@/components/motion";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { TiltCard } from "@/components/ui/tilt-card";
import { fadeInRight } from "@/lib/motion";
import { parseJsonArray } from "@/lib/utils";
import type { Profile } from "@/types/content";

/**
 * Splits on the last space so only the surname gets the accent colour.
 * A single-word name has no "given" part — the whole thing is the highlighted
 * word, so it must not also be rendered plain, or it would print twice.
 */
function splitName(fullName: string) {
  const trimmed = fullName.trim();
  const lastSpace = trimmed.lastIndexOf(" ");
  if (lastSpace === -1) return { given: "", surname: trimmed };
  return { given: trimmed.slice(0, lastSpace), surname: trimmed.slice(lastSpace + 1) };
}

export function Hero({ profile }: { profile: Profile }) {
  const taglines = parseJsonArray(profile.taglines);
  const name = splitName(profile.fullName);

  const socials = [
    profile.githubUrl && { href: profile.githubUrl, label: "GitHub", Icon: GithubIcon },
    profile.linkedinUrl && {
      href: profile.linkedinUrl,
      label: "LinkedIn",
      Icon: LinkedinIcon,
    },
    profile.twitterUrl && { href: profile.twitterUrl, label: "X", Icon: XIcon },
    profile.whatsappUrl && {
      href: profile.whatsappUrl,
      label: "WhatsApp",
      Icon: WhatsappIcon,
    },
    profile.email && {
      href: `mailto:${profile.email}`,
      label: "Email",
      Icon: Mail,
    },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof Mail }[];

  // A "0+ clients" badge undersells; only show figures that have been filled in.
  const highlights = [
    { value: profile.yearsExperience, label: "yrs experience" },
    { value: profile.projectsCount, label: "projects" },
    { value: profile.clientsCount, label: "clients" },
  ].filter((item) => item.value > 0);

  return (
    <section className="relative border-b border-hairline">
      <Container className="py-16 sm:py-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <Stagger className="max-w-xl" stagger={0.07}>
            <StaggerItem>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                {profile.available ? (
                  <span className="inline-flex items-center gap-2 text-ink-muted">
                    <span className="relative flex size-1.5">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-70" />
                      <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                    </span>
                    Available for freelance work
                  </span>
                ) : null}
                {profile.location ? (
                  <span className="inline-flex items-center gap-1.5 text-ink-subtle">
                    <MapPin className="size-3.5" aria-hidden />
                    {profile.location}
                  </span>
                ) : null}
              </div>
            </StaggerItem>

            <StaggerItem>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-ink sm:text-5xl lg:text-[3.5rem] lg:leading-[1.05]">
                {name.given ? `${name.given} ` : null}
                <span className="text-accent">{name.surname}</span>
              </h1>
            </StaggerItem>

            <StaggerItem>
              <p className="mt-3 text-lg text-ink-muted sm:text-xl">{profile.headline}</p>
            </StaggerItem>

            <StaggerItem>
              <p className="mt-6 text-base leading-relaxed text-ink-muted">
                {profile.tagline}
              </p>
            </StaggerItem>

            {taglines.length > 0 ? (
              <StaggerItem>
                <p className="mt-5 font-mono text-sm text-ink-subtle">
                  <span className="text-accent">&gt;</span>{" "}
                  <Typewriter phrases={taglines} className="text-ink" />
                </p>
              </StaggerItem>
            ) : null}

            <StaggerItem>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <ButtonLink href="/projects" size="lg">
                  View work
                  <ArrowRight className="size-4" />
                </ButtonLink>
                <ButtonLink href="/contact" variant="outline" size="lg">
                  Get in touch
                </ButtonLink>
              </div>
            </StaggerItem>

            <StaggerItem>
              <ul className="mt-8 flex items-center gap-1 border-t border-hairline pt-6">
                {socials.map(({ href, label, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      aria-label={label}
                      title={label}
                      className="inline-grid size-9 place-items-center rounded-lg text-ink-subtle transition-colors hover:bg-surface hover:text-ink"
                    >
                      <Icon className="size-4" />
                    </a>
                  </li>
                ))}
              </ul>
            </StaggerItem>
          </Stagger>

          <Reveal
            variants={fadeInRight}
            delay={0.12}
            className="lg:order-last"
          >
            <TiltCard className="mx-auto w-full max-w-sm" max={7}>
              <div className="panel relative overflow-hidden rounded-panel p-2 shadow-lift">
                <div className="relative aspect-4/5 overflow-hidden rounded-[0.6rem] bg-surface-sunken">
                  {profile.avatarUrl ? (
                    <Image
                      src={profile.avatarUrl}
                      alt={`${profile.fullName} portrait`}
                      fill
                      sizes="(max-width: 1024px) 20rem, 24rem"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="grid size-full place-items-center text-5xl font-semibold text-ink-subtle">
                      {profile.fullName.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Lifted off the card surface so the tilt reads as real depth. */}
                {highlights.length > 0 ? (
                  <div className="tilt-layer pointer-events-none absolute right-5 bottom-5 left-5">
                    <div className="panel-blur flex items-center justify-around gap-2 rounded-lg px-3.5 py-2.5 shadow-card">
                      {highlights.map((item, index) => (
                        <span key={item.label} className="flex items-center gap-2">
                          {index > 0 ? <span aria-hidden className="h-3 w-px bg-hairline-strong" /> : null}
                          <span className="text-xs text-ink-muted">
                            <span className="font-medium text-ink">{item.value}+</span> {item.label}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
