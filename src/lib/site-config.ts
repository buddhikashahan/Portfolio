export const siteConfig = {
  name: "Buddhika Shahan",
  shortName: "Buddhika",
  domain: "buddhika.dev",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://buddhika.dev",
  title: "Buddhika Shahan - Full-Stack Developer in Sri Lanka",
  description:
    "Full-stack developer building robust backends, seamless frontends, and cloud-powered products. Available for freelance work.",
  keywords: [
    "Full-Stack Developer",
    "Next.js",
    "React",
    "TypeScript",
    "Node.js",
    "Flutter",
    "Machine Learning",
    "Sri Lanka",
  ],
  locale: "en_US",
} as const;

export type NavItem = {
  href: string;
  label: string;
};

export const mainNav: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export const adminNav: { href: string; label: string; icon: string }[] = [
  { href: "/admin", label: "Overview", icon: "LayoutDashboard" },
  { href: "/admin/projects", label: "Projects", icon: "FolderGit2" },
  { href: "/admin/blog", label: "Blog", icon: "PenSquare" },
  { href: "/admin/services", label: "Services", icon: "Sparkles" },
  { href: "/admin/skills", label: "Skills", icon: "Layers" },
  { href: "/admin/experience", label: "Experience", icon: "Briefcase" },
  { href: "/admin/education", label: "Education", icon: "GraduationCap" },
  { href: "/admin/certificates", label: "Certificates", icon: "Award" },
  { href: "/admin/testimonials", label: "Testimonials", icon: "Quote" },
  { href: "/admin/messages", label: "Inbox", icon: "Inbox" },
  { href: "/admin/profile", label: "Profile", icon: "UserRound" },
];

/**
 * Full-Stack / Frontend / Backend cover most client work; AI & Data folds
 * together data analysis and ML projects that would otherwise split into two
 * near-identical buckets; Tools is for npm packages, CLIs and libraries.
 */
export const projectCategories = [
  "Full-Stack",
  "Frontend",
  "Backend",
  "Mobile",
  "Desktop",
  "AI & Data",
  "Tools",
] as const;

/** What a prospective client picks in the contact form — mirrors how the
 * portfolio itself is categorised, so an enquiry maps cleanly onto real work. */
export const projectTypes = [
  { value: "fullstack", label: "Full-Stack App" },
  { value: "frontend", label: "Frontend / Website" },
  { value: "backend", label: "Backend / API" },
  { value: "mobile", label: "Mobile App" },
  { value: "ai-ml", label: "AI / ML" },
  { value: "other", label: "Other" },
] as const;
