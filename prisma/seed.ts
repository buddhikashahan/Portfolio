import "dotenv/config";

import bcrypt from "bcryptjs";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set.");

const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@buddhika.dev";
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const name = process.env.ADMIN_NAME ?? "Buddhika Shahan";

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { name },
    create: { email, name, passwordHash, role: "ADMIN" },
  });
  console.log(`- Admin user ready: ${email}`);

  await prisma.profile.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      fullName: "Buddhika Shahan",
      headline: "Full-Stack Developer - AI/ML Enthusiast",
      tagline:
        "I turn ideas into full-stack apps - robust on the backend, seamless on the frontend, and powered by the cloud.",
      bio: [
        "I am a full-stack developer from Colombo, Sri Lanka, with a BSc (Hons) in Information Technology specialising in Artificial Intelligence.",
        "",
        "For the last five years I have been shipping production web, mobile and AI-powered products for clients around the world - from Django and Spring Boot backends to React, Next.js and Flutter frontends. I care about the parts that are easy to skip: accessibility, performance budgets, sensible data models, and interfaces that feel good to use.",
        "",
        "When I am not building, I am usually reading about machine learning, refining a design system, or automating something that did not need automating.",
      ].join("\n"),
      taglines: JSON.stringify([
        "Full-Stack Development",
        "Mobile App Development",
        "Frontend Engineering",
        "Backend Development",
        "API Design",
        "Cloud Integration",
        "UI/UX Design",
        "Database Management",
        "Automation & Scripting",
      ]),
      avatarUrl: "/photo.png",
      // Drop a PDF into /public and set this from the dashboard to show the
      // "Download CV" buttons on the about and resume pages.
      resumeUrl: null,
      email: "buddhikashahan2@gmail.com",
      location: "Colombo, Sri Lanka",
      timezone: "GMT+5:30",
      languages: "English, Sinhala",
      githubUrl: "https://github.com/buddhikashahan",
      linkedinUrl: "https://linkedin.com/in/buddhikashahan",
      whatsappUrl: "https://wa.me/94766866297",
      available: true,
      yearsExperience: 5,
      projectsCount: 7,
      clientsCount: 4,
    },
  });
  console.log("- Profile ready");

  const services = [
    {
      title: "Web Development",
      description:
        "Next.js, React, Express, Node.js, PHP and Tailwind CSS - fast, accessible, production-ready web applications.",
      icon: "Code",
    },
    {
      title: "Mobile Development",
      description:
        "React Native, Flutter and Dart. Cross-platform apps that feel native on both iOS and Android.",
      icon: "Smartphone",
    },
    {
      title: "Backend & APIs",
      description:
        "Node.js, Express, Python Django and Java Spring Boot. Well-documented REST APIs and solid authentication.",
      icon: "Server",
    },
    {
      title: "Databases",
      description:
        "MongoDB, MySQL and PostgreSQL. Schema design, indexing and migrations for structured and unstructured data.",
      icon: "Database",
    },
    {
      title: "Desktop Apps",
      description:
        "Electron applications that ship one codebase to Windows, macOS and Linux.",
      icon: "Monitor",
    },
    {
      title: "Machine Learning",
      description:
        "Python ML pipelines - predictive models, data cleaning and evaluation you can actually deploy.",
      icon: "BrainCircuit",
    },
  ];

  for (const [index, service] of services.entries()) {
    await prisma.service.upsert({
      where: { id: `seed-service-${index}` },
      update: {},
      create: { id: `seed-service-${index}`, ...service, order: index },
    });
  }
  console.log(`- ${services.length} services ready`);

  const skillCategories: {
    name: string;
    icon: string;
    description: string;
    skills: { name: string; icon: string | null; note?: string }[];
  }[] = [
    {
      name: "Frontend",
      icon: "Monitor",
      description: "Interfaces that stay fast and accessible as they grow.",
      skills: [
        { name: "React", icon: "react", note: "5 years" },
        { name: "Next.js", icon: "nextdotjs", note: "App Router" },
        { name: "TypeScript", icon: "typescript" },
        { name: "Tailwind CSS", icon: "tailwindcss" },
        { name: "Framer Motion", icon: "framer" },
        { name: "HTML", icon: "html5" },
        { name: "CSS", icon: "css" },
        { name: "Sass", icon: "sass" },
      ],
    },
    {
      name: "Backend",
      icon: "Server",
      description: "APIs, auth and the business logic behind them.",
      skills: [
        { name: "Node.js", icon: "nodedotjs" },
        { name: "Express", icon: "express" },
        { name: "Python", icon: "python" },
        { name: "Django", icon: "django" },
        { name: "Java", icon: null, note: "Spring Boot" },
        { name: "Spring Boot", icon: "springboot" },
        { name: "PHP", icon: "php" },
        { name: "GraphQL", icon: "graphql" },
      ],
    },
    {
      name: "Data",
      icon: "Database",
      description: "Schema design, indexing and migrations.",
      skills: [
        { name: "PostgreSQL", icon: "postgresql" },
        { name: "MongoDB", icon: "mongodb" },
        { name: "MySQL", icon: "mysql" },
        { name: "Prisma", icon: "prisma" },
        { name: "Redis", icon: "redis" },
        { name: "Supabase", icon: "supabase" },
      ],
    },
    {
      name: "Mobile & Desktop",
      icon: "Smartphone",
      description: "One codebase, every platform that matters.",
      skills: [
        { name: "Flutter", icon: "flutter" },
        { name: "Dart", icon: "dart" },
        { name: "React Native", icon: "react" },
        { name: "Electron", icon: "electron" },
        { name: "Android", icon: "android" },
        { name: "iOS", icon: "apple" },
      ],
    },
    {
      name: "AI & Machine Learning",
      icon: "BrainCircuit",
      description: "Modelling, evaluation and the data work around it.",
      skills: [
        { name: "PyTorch", icon: "pytorch" },
        { name: "TensorFlow", icon: "tensorflow" },
        { name: "scikit-learn", icon: "scikitlearn" },
        { name: "Pandas", icon: "pandas" },
        { name: "NumPy", icon: "numpy" },
      ],
    },
    {
      name: "Tooling & Platform",
      icon: "Wrench",
      description: "What the day-to-day actually runs on.",
      skills: [
        { name: "Git", icon: "git" },
        { name: "GitHub", icon: "github" },
        { name: "Docker", icon: "docker" },
        { name: "Vercel", icon: "vercel" },
        { name: "Cloudflare", icon: "cloudflare" },
        { name: "Figma", icon: "figma" },
        { name: "Postman", icon: "postman" },
        { name: "Vitest", icon: "vitest" },
        { name: "Linux", icon: "linux" },
      ],
    },
  ];

  for (const [index, category] of skillCategories.entries()) {
    const id = `seed-skillcat-${index}`;
    await prisma.skillCategory.upsert({
      where: { id },
      update: {},
      create: {
        id,
        name: category.name,
        icon: category.icon,
        description: category.description,
        order: index,
      },
    });

    for (const [skillIndex, skill] of category.skills.entries()) {
      await prisma.skill.upsert({
        where: { id: `${id}-skill-${skillIndex}` },
        update: {},
        create: {
          id: `${id}-skill-${skillIndex}`,
          name: skill.name,
          icon: skill.icon,
          note: skill.note ?? null,
          order: skillIndex,
          categoryId: id,
        },
      });
    }
  }
  console.log(`- ${skillCategories.length} skill categories ready`);

  const projects = [
    {
      slug: "portfolio-redesign",
      title: "Portfolio Redesign",
      summary:
        "An accessibility-first portfolio rebuild with a real content model behind it.",
      category: "Full-Stack",
      tags: "React, Tailwind, Framer Motion, Accessibility",
      coverImage:
        "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=1200&auto=format&fit=crop",
      liveUrls: JSON.stringify([{ label: "Live site", url: "https://buddhika.dev" }]),
      featured: true,
      date: new Date("2025-08-05"),
      content: [
        "## The brief",
        "",
        "The previous portfolio was a single 900-line HTML file. Every content change meant editing markup, and nothing was reusable. The goal was a site that looked considered and could be updated without touching code.",
        "",
        "## What I built",
        "",
        "- A component library of motion primitives so every section animates consistently",
        "- A content model in Prisma covering projects, posts, skills and testimonials",
        "- An admin dashboard behind session auth for day-to-day editing",
        "",
        "## Results",
        "",
        "Lighthouse moved from 71 to 99 on performance, and publishing a case study went from a deploy to a form submission.",
      ].join("\n"),
    },
    {
      slug: "expense-tracker",
      title: "Expense Tracker",
      summary:
        "A Flutter budgeting app with envelope budgets and rich spending charts.",
      category: "Mobile",
      tags: "Flutter, Dart, SQLite, Charts",
      coverImage:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop",
      featured: true,
      date: new Date("2025-07-20"),
      content: [
        "## Overview",
        "",
        "A cross-platform budgeting app built around envelope budgeting: you assign every rupee a job at the start of the month, and the app shows what is left rather than what you spent.",
        "",
        "## Highlights",
        "",
        "- Offline-first with a local SQLite store and background sync",
        "- A custom chart layer with accessible colour ramps",
        "- Biometric lock and encrypted local storage",
      ].join("\n"),
    },
    {
      slug: "pain-index",
      title: "Pain Index",
      summary:
        "A data-storytelling project mapping social and economic pressure across Sri Lanka.",
      category: "AI & Data",
      tags: "Python, Pandas, Visualisation, Storytelling",
      coverImage:
        "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?q=80&w=1200&auto=format&fit=crop",
      featured: true,
      date: new Date("2025-06-29"),
      content: [
        "## Question",
        "",
        "Inflation numbers alone do not describe how a year feels. The Pain Index combines inflation, unemployment and fuel availability into a single composite indicator, tracked by district.",
        "",
        "## Method",
        "",
        "Public datasets were cleaned in Pandas, normalised to a 0-100 scale, and weighted by household spend. The result is a small static site with scrollytelling charts.",
      ].join("\n"),
    },
    {
      slug: "training-platform",
      title: "Jinasena Training Platform",
      summary:
        "Course scheduling, enrolment and real-time analytics for a training foundation.",
      category: "Full-Stack",
      tags: "Django, React, PostgreSQL, Analytics",
      coverImage:
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop",
      date: new Date("2025-04-12"),
      content: [
        "## Context",
        "",
        "A training foundation running dozens of courses a quarter was coordinating enrolment over spreadsheets and phone calls.",
        "",
        "## Delivered",
        "",
        "- Role-based authentication for staff, instructors and trainees",
        "- Scheduling with conflict detection across rooms and instructors",
        "- A live dashboard of attendance and completion rates",
      ].join("\n"),
    },
    {
      slug: "vision-defect-detector",
      title: "Vision Defect Detector",
      summary:
        "A CNN that flags surface defects on a production line from a single camera feed.",
      category: "AI & Data",
      tags: "Python, PyTorch, OpenCV, Edge deployment",
      coverImage:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
      date: new Date("2025-02-18"),
      content: [
        "## Problem",
        "",
        "Manual QA caught defects late and inconsistently across shifts.",
        "",
        "## Approach",
        "",
        "A fine-tuned ResNet-18 trained on 4,200 labelled frames, quantised and deployed to an edge device beside the line. Precision at the chosen threshold is 0.94 within a 30ms inference budget.",
      ].join("\n"),
    },
    {
      slug: "invoice-desk",
      title: "Invoice Desk",
      summary:
        "An Electron desktop app for offline invoicing, PDF export and VAT reporting.",
      category: "Desktop",
      tags: "Electron, React, SQLite, PDF",
      coverImage:
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1200&auto=format&fit=crop",
      date: new Date("2024-11-30"),
      content: [
        "## Why desktop",
        "",
        "The client works from sites with unreliable connectivity, so a browser tab was never going to be enough.",
        "",
        "## Features",
        "",
        "- Fully offline with an encrypted local database",
        "- One-click PDF invoices from customisable templates",
        "- Quarterly VAT summaries exported to CSV",
      ].join("\n"),
    },
  ];

  for (const [index, project] of projects.entries()) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: {},
      create: { ...project, order: index, published: true },
    });
  }
  console.log(`- ${projects.length} projects ready`);

  const posts = [
    {
      slug: "shipping-a-portfolio-that-updates-itself",
      title: "Shipping a portfolio that updates itself",
      excerpt:
        "Why I replaced a hand-edited HTML file with a content model, and what the admin dashboard actually needed to do.",
      tags: "Next.js, Prisma, Architecture",
      publishedAt: new Date("2025-08-12"),
      coverImage:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop",
      featured: true,
      content: [
        "Every portfolio starts as one HTML file and ends as a maintenance problem. Mine lasted about eight months before I stopped updating it, which is the real failure mode: not that the site was ugly, but that publishing had friction.",
        "",
        "## Model the content, not the page",
        "",
        "The first thing I did was stop thinking in sections and start thinking in entities. A portfolio is really six or seven collections - projects, posts, skills, roles, certificates, testimonials, messages - plus one singleton profile row.",
        "",
        "Once that was in Prisma, the page components became pure presentation. The home page does not know where a project came from; it takes an array and renders it.",
        "",
        "## Make publishing boring",
        "",
        "The admin dashboard has exactly one job: let me change something in under thirty seconds. That meant server actions over API routes, pending states on every button, and validation that tells me which field is wrong instead of throwing a stack trace.",
        "",
        "## The part I would do again",
        "",
        "Putting the auth check in a data-access layer rather than only in the route guard. Server Actions are reachable by direct POST, so the routing guard is a convenience - the data layer is the boundary that matters.",
      ].join("\n"),
    },
    {
      slug: "animation-that-earns-its-place",
      title: "Animation that earns its place",
      excerpt:
        "A practical set of rules for using Framer Motion without making your site feel like a screensaver.",
      tags: "Framer Motion, UI, Design",
      publishedAt: new Date("2025-07-02"),
      coverImage:
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop",
      content: [
        "Motion is the easiest thing to overdo, because every individual animation looks good in isolation. The test is not whether a transition is pretty - it is whether removing it would make the interface harder to understand.",
        "",
        "## Three rules I keep",
        "",
        "1. **Animate to explain, not to decorate.** A card that lifts on hover tells you it is clickable. A card that pulses forever tells you nothing.",
        "2. **One motion vocabulary per site.** Pick your durations and easing curves once, put them in a shared variants file, and never hand-write a transition object in a component again.",
        "3. **Respect reduced motion.** Not as an afterthought, but as the default branch in your shared hook.",
        "",
        "## Durations that feel right",
        "",
        "Entrances 400-600ms, hovers 150-200ms, layout shifts 250-350ms. Anything above 700ms reads as slow no matter how nice the curve is.",
      ].join("\n"),
    },
    {
      slug: "prisma-as-a-content-layer",
      title: "Using Prisma as a lightweight content layer",
      excerpt:
        "You do not always need a headless CMS. Here is the setup I use when the site has exactly one editor.",
      tags: "Prisma, CMS, Databases",
      publishedAt: new Date("2025-05-19"),
      coverImage:
        "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=1200&auto=format&fit=crop",
      content: [
        "Headless CMS platforms solve a real problem: many editors, complex workflows, and content that outlives the site. If none of that describes your project, they are mostly a bill and an API you did not need.",
        "",
        "## The single-editor setup",
        "",
        "A Prisma schema, a handful of server actions, and a dashboard behind session auth covers a personal site completely. You get type safety end to end, migrations in version control, and no vendor to migrate off later.",
        "",
        "## Where it stops working",
        "",
        "The moment a second person needs to publish, you want drafts, review states and an audit trail. That is the point to reach for something bigger - not before.",
      ].join("\n"),
    },
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: { ...post, published: true },
    });
  }
  console.log(`- ${posts.length} blog posts ready`);

  const experiences = [
    {
      role: "Full-Stack Web Developer",
      company: "Jinasena Training Foundation",
      location: "Colombo, Sri Lanka",
      description:
        "Led the design and development of a training-management platform covering authentication, course scheduling and real-time analytics. Built with Python, Django, React and PostgreSQL, with a design system that keeps new screens consistent.",
      tags: "Python, Django, React, PostgreSQL, Design Systems",
      startDate: new Date("2023-01-01"),
      current: true,
    },
    {
      role: "Freelance Full-Stack Developer & AI/ML Specialist",
      company: "Self-employed",
      location: "Remote",
      description:
        "Delivered custom web, mobile and AI-powered solutions for clients worldwide. Built responsive applications and APIs, integrated machine learning models, and worked directly with founders on scope, timelines and rollout.",
      tags: "React, Node.js, Flutter, MongoDB, AI/ML, Cloud",
      startDate: new Date("2020-06-01"),
      current: true,
    },
  ];

  for (const [index, experience] of experiences.entries()) {
    await prisma.experience.upsert({
      where: { id: `seed-exp-${index}` },
      update: {},
      create: { id: `seed-exp-${index}`, ...experience, order: index },
    });
  }
  console.log(`- ${experiences.length} roles ready`);

  await prisma.education.upsert({
    where: { id: "seed-edu-0" },
    update: {},
    create: {
      id: "seed-edu-0",
      degree:
        "BSc (Hons) in Information Technology, specialising in Artificial Intelligence",
      institution: "Sri Lanka Institute of Information Technology (SLIIT)",
      description:
        "Coursework across software engineering, distributed systems, machine learning and data mining. Final-year research focused on computer-vision quality inspection.",
      startYear: "2019",
      endYear: "2023",
      order: 0,
    },
  });
  console.log("- Education ready");

  const certificates = [
    { title: "Introduction to Python", issuer: "Sololearn", year: "2024" },
    { title: "Introduction to JavaScript", issuer: "Sololearn", year: "2024" },
    { title: "Introduction to C", issuer: "Sololearn", year: "2024" },
    {
      title: "Web Design for Beginners",
      issuer: "University of Moratuwa",
      year: "2024",
    },
  ];

  for (const [index, certificate] of certificates.entries()) {
    await prisma.certificate.upsert({
      where: { id: `seed-cert-${index}` },
      update: {},
      create: { id: `seed-cert-${index}`, ...certificate, order: index },
    });
  }
  console.log(`- ${certificates.length} certificates ready`);

  const testimonials = [
    {
      name: "A. Fernando",
      role: "Product Lead",
      quote:
        "Buddhi shipped a polished app ahead of schedule - stellar attention to detail, and the kind of communication that makes a remote engagement feel local.",
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop",
    },
    {
      name: "S. Perera",
      role: "Founder",
      quote:
        "Great communication, clean code, and the UI genuinely pops. He pushed back on two decisions that would have cost us later, which I appreciated.",
      avatarUrl:
        "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=300&auto=format&fit=crop",
    },
    {
      name: "D. Jay",
      role: "CTO",
      quote:
        "Understood our users quickly and delivered smooth experiences across web and mobile. Handover documentation was better than most in-house teams produce.",
      avatarUrl:
        "https://images.unsplash.com/photo-1544006659-f0b21884ce1d?q=80&w=300&auto=format&fit=crop",
    },
  ];

  for (const [index, testimonial] of testimonials.entries()) {
    await prisma.testimonial.upsert({
      where: { id: `seed-testimonial-${index}` },
      update: {},
      create: { id: `seed-testimonial-${index}`, ...testimonial, order: index },
    });
  }
  console.log(`- ${testimonials.length} testimonials ready`);

  console.log("\nSeed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
