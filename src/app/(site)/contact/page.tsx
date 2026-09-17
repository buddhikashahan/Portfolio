import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, Mail, MapPin } from "lucide-react";

import {
  GithubIcon,
  LinkedinIcon,
  WhatsappIcon,
} from "@/components/ui/brand-icons";

import { Reveal } from "@/components/motion";
import { ContactForm } from "@/components/site/contact-form";
import { Card } from "@/components/ui/card";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { getProfile } from "@/lib/queries";
import { fadeInLeft, fadeInRight } from "@/lib/motion";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a project conversation. Tell me what you are building and I will reply within a day.",
  alternates: { canonical: "/contact" },
};

const promises = [
  "A reply within one working day",
  "An honest answer on fit, scope and timeline",
  "Clean, documented code you can hand to anyone",
  "No retainer games or surprise line items",
];

export default async function ContactPage() {
  const profile = await getProfile();

  if (!profile) notFound();

  const channels = [
    profile.email && {
      Icon: Mail,
      label: "Email",
      value: profile.email,
      href: `mailto:${profile.email}`,
    },
    profile.whatsappUrl && {
      Icon: WhatsappIcon,
      label: "WhatsApp",
      value: "Message me directly",
      href: profile.whatsappUrl,
    },
    profile.githubUrl && {
      Icon: GithubIcon,
      label: "GitHub",
      value: "See what I build",
      href: profile.githubUrl,
    },
    profile.linkedinUrl && {
      Icon: LinkedinIcon,
      label: "LinkedIn",
      value: "Connect professionally",
      href: profile.linkedinUrl,
    },
  ].filter(Boolean) as {
    Icon: typeof Mail;
    label: string;
    value: string;
    href: string;
  }[];

  return (
    <Section top="tight" bottom="last">
      <Container>
        <SectionHeading
          as="h1"
          eyebrow="Get in touch"
          title="Let's work together"
          description="Have a project in mind? Send the details and I will come back with an honest read on scope, timeline and whether I am the right person for it."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
          <Reveal variants={fadeInLeft} className="space-y-6">
            <Card>
              <h2 className="font-semibold text-ink">What you can expect</h2>
              <ul className="mt-4 space-y-3">
                {promises.map((promise) => (
                  <li key={promise} className="flex gap-3 text-sm text-ink-muted">
                    <CheckCircle2
                      className="mt-0.5 size-4 shrink-0 text-emerald-400"
                      aria-hidden
                    />
                    {promise}
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <h2 className="font-semibold text-ink">Other ways to reach me</h2>
              <ul className="mt-4 space-y-2">
                {channels.map(({ Icon, label, value, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 transition hover:bg-surface-raised"
                    >
                      <span className="inline-grid size-9 shrink-0 place-items-center rounded-lg border border-hairline bg-surface text-accent">
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-ink">
                          {label}
                        </span>
                        <span className="block text-xs text-ink-subtle">{value}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>

              {profile.location ? (
                <p className="mt-5 flex items-center gap-2 border-t border-hairline pt-5 text-sm text-ink-muted">
                  <MapPin className="size-4 text-accent" aria-hidden />
                  Based in {profile.location}, working with clients everywhere.
                </p>
              ) : null}
            </Card>
          </Reveal>

          <Reveal variants={fadeInRight} delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
