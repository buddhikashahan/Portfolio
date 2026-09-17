import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { Hero } from "@/components/site/hero";
import { PostCard } from "@/components/site/post-card";
import { ProjectCard } from "@/components/site/project-card";
import { ServicesGrid } from "@/components/site/services-grid";
import { StackMarquee } from "@/components/site/stack-marquee";
import { TestimonialSlider } from "@/components/site/testimonial-slider";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section, SectionBar, SectionHeading } from "@/components/ui/section";
import {
  getExperiences,
  getFeaturedProjects,
  getProfile,
  getRecentPosts,
  getServices,
  getSkillCategories,
  getTestimonials,
} from "@/lib/queries";
import { jsonLd } from "@/lib/json-ld";
import { siteConfig } from "@/lib/site-config";
import { formatDateRange } from "@/lib/utils";

export default async function HomePage() {
  // Independent reads, so fetch them in parallel rather than awaiting in series.
  const [profile, services, skillCategories, projects, posts, testimonials, experiences] =
    await Promise.all([
      getProfile(),
      getServices(),
      getSkillCategories(),
      getFeaturedProjects(3),
      getRecentPosts(3),
      getTestimonials(),
      getExperiences(),
    ]);

  // The profile is a singleton seeded on install; without it there is no site.
  if (!profile) notFound();

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.fullName,
    jobTitle: profile.headline,
    email: `mailto:${profile.email}`,
    url: siteConfig.url,
    ...(profile.location ? { address: { "@type": "PostalAddress", addressLocality: profile.location } } : {}),
    sameAs: [profile.githubUrl, profile.linkedinUrl, profile.twitterUrl].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Serialised from our own profile row; there is no user HTML here.
        dangerouslySetInnerHTML={jsonLd(personJsonLd)}
      />
      <Hero profile={profile} />

      <StackMarquee categories={skillCategories} />

      <Section bordered>
        <Container>
          <SectionHeading
            eyebrow="What I do"
            title="Services"
            description="End-to-end product work — from the data model and API through to the interface people actually touch."
          />
          <div className="mt-12">
            <ServicesGrid services={services} />
          </div>
        </Container>
      </Section>

      <Section bordered>
        <Container>
          <SectionBar
            eyebrow="Selected work"
            title="Recent projects"
            description="Each one written up as a short case study: the problem, the approach, and what changed as a result."
            action={
              <ButtonLink href="/projects" variant="outline" size="sm">
                All projects
                <ArrowRight className="size-4" />
              </ButtonLink>
            }
          />

          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
            {projects.map((project) => (
              <StaggerItem key={project.id} className="h-full">
                <ProjectCard project={project} />
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>


      {experiences.length > 0 ? (
        <Section bordered>
          <Container>
            <SectionBar
              eyebrow="Track record"
              title="Where I have worked"
              action={
                <ButtonLink href="/about" variant="outline" size="sm">
                  Full background
                  <ArrowRight className="size-4" />
                </ButtonLink>
              }
            />

            <Stagger className="mt-12 divide-y divide-[var(--hairline)]" stagger={0.07}>
              {experiences.slice(0, 3).map((experience) => (
                <StaggerItem key={experience.id}>
                  <div className="grid gap-2 py-6 first:pt-0 sm:grid-cols-[13rem_1fr] sm:gap-8">
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
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
                        {experience.description}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </Container>
        </Section>
      ) : null}

      {testimonials.length > 0 ? (
        <Section bordered>
          <Container>
            <SectionHeading
              eyebrow="References"
              title="What clients say"
              align="center"
            />
            <div className="mx-auto mt-12 max-w-2xl">
              <TestimonialSlider testimonials={testimonials} />
            </div>
          </Container>
        </Section>
      ) : null}

      {posts.length > 0 ? (
        <Section bordered>
          <Container>
            <SectionBar
              eyebrow="Writing"
              title="From the blog"
              description="Notes on architecture, interface design, and the occasional lesson learned the hard way."
              action={
                <ButtonLink href="/blog" variant="outline" size="sm">
                  All posts
                  <ArrowRight className="size-4" />
                </ButtonLink>
              }
            />

            <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
              {posts.map((post) => (
                <StaggerItem key={post.id} className="h-full">
                  <PostCard post={post} />
                </StaggerItem>
              ))}
            </Stagger>
          </Container>
        </Section>
      ) : null}

      <Section bordered bottom="last">
        <Container>
          <Reveal>
            <div className="panel grid-backdrop overflow-hidden rounded-panel px-6 py-16 text-center sm:px-12">
              <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                Have something in mind?
              </h2>
              <p className="mx-auto mt-3 max-w-lg leading-relaxed text-ink-muted">
                Tell me about the project. I reply to every message, usually within a
                day, and I will be straight with you about whether I am the right fit.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <ButtonLink href="/contact" size="lg">
                  Start a conversation
                  <ArrowRight className="size-4" />
                </ButtonLink>
                <ButtonLink href="/about" variant="outline" size="lg">
                  About me
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
