import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\/|^\//.test(v), {
    message: "Must be an absolute URL or a path starting with /",
  })
  .transform((v) => (v === "" ? null : v))
  .nullable();

const optionalText = (max = 500) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? null : v))
    .nullable();

/**
 * Validates a `{ label, url }[]` list submitted as one JSON string — the shape
 * `LinkListField` keeps in local state and serialises into a hidden input,
 * used for both a project's repositories and its live links. Re-serialises on
 * success, so the parsed field is already the storage-ready string the rest
 * of the schema's fields are.
 */
function labeledLinksFromForm(noun: string, max = 12) {
  const entry = z.object({
    label: z.string().trim().min(1, `Each ${noun} needs a label`).max(40),
    url: z
      .string()
      .trim()
      .min(1, `Each ${noun} needs a URL`)
      .max(300)
      .refine((v) => /^https?:\/\//.test(v), "Must be a valid https:// URL"),
  });

  return z
    .string()
    .default("[]")
    .transform((value, ctx) => {
      let parsed: unknown;
      try {
        parsed = value.trim() === "" ? [] : JSON.parse(value);
      } catch {
        ctx.addIssue({ code: "custom", message: "List could not be read." });
        return z.NEVER;
      }

      const result = z.array(entry).max(max, `Up to ${max}.`).safeParse(parsed);
      if (!result.success) {
        ctx.addIssue({
          code: "custom",
          message: result.error.issues[0]?.message ?? `Check each ${noun}'s label and URL.`,
        });
        return z.NEVER;
      }

      return JSON.stringify(result.data);
    });
}

const slug = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes");

const checkbox = z
  .union([z.boolean(), z.string()])
  .transform((v) => v === true || v === "on" || v === "true");

const intFromForm = (fallback = 0) =>
  z
    .union([z.number(), z.string()])
    .transform((v) => {
      const n = typeof v === "number" ? v : Number.parseInt(v, 10);
      return Number.isFinite(n) ? n : fallback;
    });

const dateFromForm = z
  .union([z.string(), z.date()])
  .transform((v) => (v instanceof Date ? v : new Date(v)))
  .refine((d) => !Number.isNaN(d.getTime()), "Enter a valid date");

const optionalDateFromForm = z
  .union([z.string(), z.date()])
  .transform((v) => {
    if (v instanceof Date) return v;
    if (v.trim() === "") return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  })
  .nullable();

// --- Auth -----------------------------------------------------------------

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(10, "Use at least 10 characters")
      .max(128)
      .regex(/[a-z]/, "Include a lowercase letter")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/[0-9]/, "Include a number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// --- Content --------------------------------------------------------------

export const projectSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(120),
  slug,
  summary: z.string().trim().min(10, "Write at least a sentence").max(300),
  content: z.string().max(50_000).default(""),
  coverImage: optionalUrl,
  category: z.string().trim().min(1).max(40),
  tags: z.string().trim().max(300).default(""),
  repos: labeledLinksFromForm("repository"),
  liveUrls: labeledLinksFromForm("link"),
  featured: checkbox,
  published: checkbox,
  order: intFromForm(0),
  date: dateFromForm,
});

export const postSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(160),
  slug,
  excerpt: z.string().trim().min(10, "Write a short summary").max(300),
  content: z.string().max(100_000).default(""),
  coverImage: optionalUrl,
  tags: z.string().trim().max(300).default(""),
  published: checkbox,
  featured: checkbox,
  publishedAt: optionalDateFromForm,
});

export const serviceSchema = z.object({
  title: z.string().trim().min(2).max(80),
  description: z.string().trim().min(10).max(400),
  icon: z.string().trim().min(1).max(40).default("Code"),
  order: intFromForm(0),
  published: checkbox,
});

export const skillCategorySchema = z.object({
  name: z.string().trim().min(2).max(60),
  description: optionalText(200),
  icon: z.string().trim().min(1).max(40).default("Layers"),
  order: intFromForm(0),
});

export const skillSchema = z.object({
  categoryId: z.string().trim().min(1, "Pick a category"),
  name: z.string().trim().min(1).max(60),
  /** Simple Icons slug; empty means render a lettered tile instead. */
  icon: optionalText(40),
  note: optionalText(60),
  order: intFromForm(0),
});

export const experienceSchema = z.object({
  role: z.string().trim().min(2).max(120),
  company: z.string().trim().min(1).max(120),
  location: optionalText(120),
  description: z.string().trim().min(10).max(2000),
  tags: z.string().trim().max(300).default(""),
  startDate: dateFromForm,
  endDate: optionalDateFromForm,
  current: checkbox,
  order: intFromForm(0),
});

export const educationSchema = z.object({
  degree: z.string().trim().min(2).max(200),
  institution: z.string().trim().min(2).max(160),
  description: optionalText(1000),
  startYear: z.string().trim().min(4).max(10),
  endYear: optionalText(10),
  order: intFromForm(0),
});

export const certificateSchema = z.object({
  title: z.string().trim().min(2).max(160),
  issuer: z.string().trim().min(2).max(120),
  year: z.string().trim().min(4).max(10),
  url: optionalUrl,
  order: intFromForm(0),
});

export const testimonialSchema = z.object({
  name: z.string().trim().min(2).max(80),
  role: optionalText(80),
  company: optionalText(80),
  quote: z.string().trim().min(10).max(1000),
  avatarUrl: optionalUrl,
  rating: intFromForm(5),
  published: checkbox,
  order: intFromForm(0),
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  headline: z.string().trim().min(2).max(160),
  tagline: z.string().trim().min(2).max(300),
  bio: z.string().trim().min(10).max(4000),
  taglines: z.string().max(2000).default(""),
  avatarUrl: optionalUrl,
  resumeUrl: optionalUrl,
  email: z.email(),
  location: optionalText(120),
  timezone: optionalText(40),
  languages: optionalText(160),
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  whatsappUrl: optionalUrl,
  twitterUrl: optionalUrl,
  available: checkbox,
  yearsExperience: intFromForm(0),
  projectsCount: intFromForm(0),
  clientsCount: intFromForm(0),
});

// --- Public contact form ---------------------------------------------------

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Tell me your name").max(80),
  email: z.email("Enter a valid email address"),
  company: optionalText(120),
  projectType: optionalText(40),
  message: z.string().trim().min(20, "A little more detail helps").max(4000),
  // Honeypot: real users never fill this in.
  website: z.string().max(0, "Spam detected").optional().default(""),
});

