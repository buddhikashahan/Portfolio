import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Award,
  Clock,
  Download,
  GraduationCap,
  Languages,
  Mail,
  MapPin,
  Monitor,
} from "lucide-react";

import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { ServicesGrid } from "@/components/site/services-grid";
import { SkillsSection } from "@/components/site/skills-section";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import {
  getCertificates,
  getEducation,
  getExperiences,
  getProfile,
  getServices,
  getSkillCategories,
} from "@/lib/queries";
import { jsonLd } from "@/lib/json-ld";
import { fadeInLeft, fadeInRight } from "@/lib/motion";
import { siteConfig } from "@/lib/site-config";
import { absoluteUrl, formatDateRange, parseTags } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Background, Experience & Skills",
  description:
    "Full-stack developer from Colombo, Sri Lanka. Background, experience, education and the stack I build on.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [profile, services, skillCategories, experiences, education, certificates] =
    await Promise.all([
      getProfile(),
      getServices(),
      getSkillCategories(),
      getExperiences(),
      getEducation(),
      getCertificates(),
    ]);

  if (!profile) notFound();

  // Only what a prospective client needs to work with me. Personal details
  // such as age or marital status have no bearing on the work, and a public
  // phone number mostly attracts spam when email and the contact form exist.
  const facts = [
    profile.location && { Icon: MapPin, label: "Based in", value: profile.location },
    profile.timezone && { Icon: Clock, label: "Timezone", value: profile.timezone },
    { Icon: Monitor, label: "Works", value: "Remote, worldwide" },
    profile.languages && {
      Icon: Languages,
      label: "Languages",
      value: profile.languages,
    },
    { Icon: Mail, label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  ].filter(Boolean) as {
    Icon: typeof MapPin;
    label: string;
    value: string;
    href?: string;
  }[];

  const profilePageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: profile.fullName,
      jobTitle: profile.headline,
      description: profile.bio,
      email: `mailto:${profile.email}`,
      url: siteConfig.url,
      image: profile.avatarUrl ? absoluteUrl(profile.avatarUrl) : undefined,
      ...(profile.location
        ? { address: { "@type": "PostalAddress", addressLocality: profile.location } }
        : {}),
      sameAs: [profile.githubUrl, profile.linkedinUrl, profile.twitterUrl].filter(Boolean),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(profilePageJsonLd)}
      />
      <Section top="tight">
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
            <Reveal variants={fadeInLeft}>
              <p className="font-mono text-xs tracking-[0.16em] text-ink-subtle uppercase">
                About &amp; resume
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                About me
              </h1>

              <div className="prose-custom mt-8">
                {profile.bio
                  .split("\n")
                  .filter((paragraph) => paragraph.trim().length > 0)
                  .map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/contact">Work with me</ButtonLink>
                {profile.resumeUrl ? (
                  <ButtonLink href={profile.resumeUrl} variant="outline" download>
                    <Download className="size-4" />
                    Download CV
                  </ButtonLink>
                ) : null}
                <ButtonLink href="/projects" variant="ghost">
                  See the work
                </ButtonLink>
              </div>
            </Reveal>

            <Reveal variants={fadeInRight} delay={0.1}>
              <Card>
                <div className="flex items-center gap-4">
                  {profile.avatarUrl ? (
                    <Image
                      src={profile.avatarUrl}
                      alt={`${profile.fullName} photo`}
                      width={56}
                      height={56}
                      className="size-14 rounded-lg object-cover ring-1 ring-hairline"
                    />
                  ) : null}
                  <div>
                    <h2 className="font-medium text-ink">{profile.fullName}</h2>
                    <p className="text-sm text-ink-muted">{profile.headline}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge>{profile.yearsExperience}+ yrs experience</Badge>
                  <Badge>{profile.projectsCount}+ projects</Badge>
                  {profile.available ? (
                    <Badge tone="success">Available</Badge>
                  ) : (
                    <Badge tone="muted">Booked</Badge>
                  )}
                </div>

                <dl className="mt-6 divide-y divide-(--hairline) border-t border-hairline text-sm">
                  {facts.map(({ Icon, label, value, href }) => (
                    <div key={label} className="flex items-center justify-between gap-4 py-3">
                      <dt className="flex shrink-0 items-center gap-2.5 text-ink-subtle">
                        <Icon className="size-4 shrink-0" aria-hidden />
                        {label}
                      </dt>
                      <dd className="min-w-0 flex-1 truncate text-right text-ink">
                        {href ? (
                          <a href={href} className="transition-colors hover:text-accent">
                            {value}
                          </a>
                        ) : (
                          value
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Card>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section id="services" bordered>
        <Container>
          <SectionHeading
            eyebrow="How I help"
            title="Services"
            description="The kinds of work I take on."
          />
          <div className="mt-12">
            <ServicesGrid services={services} />
          </div>
        </Container>
      </Section>

      <Section id="experience" bordered>
        <Container>
          <SectionHeading
            eyebrow="Track record"
            title="Experience"
            description="Roles, and what actually changed because of them."
          />

          <Stagger className="mt-12 divide-y divide-(--hairline)" stagger={0.08}>
            {experiences.map((experience) => (
              <StaggerItem key={experience.id}>
                <div className="grid gap-2 py-7 first:pt-0 sm:grid-cols-[13rem_1fr] sm:gap-8">
                  <p className="font-mono text-xs text-ink-subtle sm:pt-1">
                    {formatDateRange(
                      experience.startDate,
                      experience.endDate,
                      experience.current,
                    )}
                  </p>
                  <div>
                    <h3 className="font-medium text-ink">
                      {experience.role}
                      <span className="text-ink-subtle"> · {experience.company}</span>
                    </h3>
                    {experience.location ? (
                      <p className="mt-0.5 text-xs text-ink-subtle">
                        {experience.location}
                      </p>
                    ) : null}
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
                      {experience.description}
                    </p>
                    {parseTags(experience.tags).length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
                        {parseTags(experience.tags).map((tag) => (
                          <span key={tag} className="font-mono text-xs text-ink-subtle">
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      <Section id="education" bordered>
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="flex items-center gap-3 text-xl font-semibold tracking-tight text-ink">
                <span className="inline-grid size-8 place-items-center rounded-lg border border-hairline bg-surface text-ink-muted">
                  <GraduationCap className="size-4" aria-hidden />
                </span>
                Education
              </h2>

              <Stagger className="mt-8 space-y-7" stagger={0.08}>
                {education.map((item) => (
                  <StaggerItem key={item.id}>
                    <p className="font-mono text-xs text-ink-subtle">
                      {item.startYear} - {item.endYear ?? "Present"}
                    </p>
                    <h3 className="mt-1.5 font-medium text-ink">{item.degree}</h3>
                    <p className="mt-0.5 text-sm text-ink-muted">{item.institution}</p>
                    {item.description ? (
                      <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                        {item.description}
                      </p>
                    ) : null}
                  </StaggerItem>
                ))}
              </Stagger>
            </div>

            <div>
              <h2 className="flex items-center gap-3 text-xl font-semibold tracking-tight text-ink">
                <span className="inline-grid size-8 place-items-center rounded-lg border border-hairline bg-surface text-ink-muted">
                  <Award className="size-4" aria-hidden />
                </span>
                Certificates
              </h2>

              <Stagger
                className="mt-8 divide-y divide-(--hairline) border-y border-hairline"
                stagger={0.05}
              >
                {certificates.map((certificate) => (
                  <StaggerItem key={certificate.id}>
                    <div className="flex items-center justify-between gap-4 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-ink">
                          {certificate.url ? (
                            <a
                              href={certificate.url}
                              target="_blank"
                              rel="noreferrer"
                              className="transition-colors hover:text-accent"
                            >
                              {certificate.title}
                            </a>
                          ) : (
                            certificate.title
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-subtle">
                          {certificate.issuer}
                        </p>
                      </div>
                      <span className="font-mono text-xs text-ink-subtle">
                        {certificate.year}
                      </span>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </div>
        </Container>
      </Section>

      <Section id="stack" bordered bottom="last">
        <Container>
          <SectionHeading
            eyebrow="Toolkit"
            title="Stack"
            description="What I reach for, grouped by where it sits in a system."
          />
          <div className="mt-12">
            <SkillsSection categories={skillCategories} />
          </div>

          <Reveal className="mt-14">
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-8">
              <p className="text-sm text-ink-muted">
                Want the short version as a PDF, or a project scoped out?
              </p>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/contact">Get in touch</ButtonLink>
                {profile.resumeUrl ? (
                  <ButtonLink href={profile.resumeUrl} variant="outline" download>
                    <Download className="size-4" />
                    Download CV
                  </ButtonLink>
                ) : null}
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
