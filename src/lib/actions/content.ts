"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/auth/dal";
import {
  asWriteDelegate,
  createEntityAction,
  deleteEntityAction,
  updateEntityAction,
  type CrudConfig,
} from "@/lib/actions/crud";
import {
  certificateSchema,
  educationSchema,
  experienceSchema,
  profileSchema,
  serviceSchema,
  skillCategorySchema,
  skillSchema,
  testimonialSchema,
} from "@/lib/validations";
import { failure, formDataToObject, success, validationFailed } from "@/lib/actions/helpers";
import type { FormState } from "@/lib/actions/types";
import { replaceUpload } from "@/lib/storage";

/*
 * Each entity declares its config once, then exports thin async wrappers.
 * The wrappers exist because every export from a `"use server"` module must be
 * an async function declaration Next.js can register as an action endpoint.
 */

const serviceConfig = {
  schema: serviceSchema,
  delegate: asWriteDelegate(prisma.service),
  checkboxes: ["published"],
  paths: ["/", "/about", "/admin/services"],
  label: "service",
} satisfies CrudConfig<typeof serviceSchema>;

const skillCategoryConfig = {
  schema: skillCategorySchema,
  delegate: asWriteDelegate(prisma.skillCategory),
  paths: ["/", "/about", "/admin/skills"],
  label: "skill category",
} satisfies CrudConfig<typeof skillCategorySchema>;

const skillConfig = {
  schema: skillSchema,
  delegate: asWriteDelegate(prisma.skill),
  paths: ["/", "/about", "/admin/skills"],
  label: "skill",
} satisfies CrudConfig<typeof skillSchema>;

const experienceConfig = {
  schema: experienceSchema,
  delegate: asWriteDelegate(prisma.experience),
  checkboxes: ["current"],
  paths: ["/", "/about", "/admin/experience"],
  label: "role",
} satisfies CrudConfig<typeof experienceSchema>;

const educationConfig = {
  schema: educationSchema,
  delegate: asWriteDelegate(prisma.education),
  paths: ["/about", "/admin/education"],
  label: "qualification",
} satisfies CrudConfig<typeof educationSchema>;

const certificateConfig = {
  schema: certificateSchema,
  delegate: asWriteDelegate(prisma.certificate),
  paths: ["/about", "/admin/certificates"],
  label: "certificate",
} satisfies CrudConfig<typeof certificateSchema>;

const testimonialConfig = {
  schema: testimonialSchema,
  delegate: asWriteDelegate(prisma.testimonial),
  checkboxes: ["published"],
  paths: ["/", "/admin/testimonials"],
  label: "testimonial",
  uploadFields: ["avatarUrl"],
} satisfies CrudConfig<typeof testimonialSchema>;

// --- Services --------------------------------------------------------------

const _createService = createEntityAction(serviceConfig);
const _updateService = updateEntityAction(serviceConfig);
const _deleteService = deleteEntityAction(serviceConfig);

export async function createService(state: FormState, formData: FormData) {
  return _createService(state, formData);
}
export async function updateService(state: FormState, formData: FormData) {
  return _updateService(state, formData);
}
export async function deleteService(formData: FormData) {
  return _deleteService(formData);
}

// --- Skill categories ------------------------------------------------------

const _createSkillCategory = createEntityAction(skillCategoryConfig);
const _updateSkillCategory = updateEntityAction(skillCategoryConfig);
const _deleteSkillCategory = deleteEntityAction(skillCategoryConfig);

export async function createSkillCategory(state: FormState, formData: FormData) {
  return _createSkillCategory(state, formData);
}
export async function updateSkillCategory(state: FormState, formData: FormData) {
  return _updateSkillCategory(state, formData);
}
export async function deleteSkillCategory(formData: FormData) {
  return _deleteSkillCategory(formData);
}

// --- Skills ----------------------------------------------------------------

const _createSkill = createEntityAction(skillConfig);
const _updateSkill = updateEntityAction(skillConfig);
const _deleteSkill = deleteEntityAction(skillConfig);

export async function createSkill(state: FormState, formData: FormData) {
  return _createSkill(state, formData);
}
export async function updateSkill(state: FormState, formData: FormData) {
  return _updateSkill(state, formData);
}
export async function deleteSkill(formData: FormData) {
  return _deleteSkill(formData);
}

// --- Experience ------------------------------------------------------------

const _createExperience = createEntityAction(experienceConfig);
const _updateExperience = updateEntityAction(experienceConfig);
const _deleteExperience = deleteEntityAction(experienceConfig);

export async function createExperience(state: FormState, formData: FormData) {
  return _createExperience(state, formData);
}
export async function updateExperience(state: FormState, formData: FormData) {
  return _updateExperience(state, formData);
}
export async function deleteExperience(formData: FormData) {
  return _deleteExperience(formData);
}

// --- Education -------------------------------------------------------------

const _createEducation = createEntityAction(educationConfig);
const _updateEducation = updateEntityAction(educationConfig);
const _deleteEducation = deleteEntityAction(educationConfig);

export async function createEducation(state: FormState, formData: FormData) {
  return _createEducation(state, formData);
}
export async function updateEducation(state: FormState, formData: FormData) {
  return _updateEducation(state, formData);
}
export async function deleteEducation(formData: FormData) {
  return _deleteEducation(formData);
}

// --- Certificates ----------------------------------------------------------

const _createCertificate = createEntityAction(certificateConfig);
const _updateCertificate = updateEntityAction(certificateConfig);
const _deleteCertificate = deleteEntityAction(certificateConfig);

export async function createCertificate(state: FormState, formData: FormData) {
  return _createCertificate(state, formData);
}
export async function updateCertificate(state: FormState, formData: FormData) {
  return _updateCertificate(state, formData);
}
export async function deleteCertificate(formData: FormData) {
  return _deleteCertificate(formData);
}

// --- Testimonials ----------------------------------------------------------

const _createTestimonial = createEntityAction(testimonialConfig);
const _updateTestimonial = updateEntityAction(testimonialConfig);
const _deleteTestimonial = deleteEntityAction(testimonialConfig);

export async function createTestimonial(state: FormState, formData: FormData) {
  return _createTestimonial(state, formData);
}
export async function updateTestimonial(state: FormState, formData: FormData) {
  return _updateTestimonial(state, formData);
}
export async function deleteTestimonial(formData: FormData) {
  return _deleteTestimonial(formData);
}

// --- Profile (singleton) ---------------------------------------------------

export async function updateProfile(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await assertAdmin();

  const parsed = profileSchema.safeParse(
    (() => {
      const data = formDataToObject(formData);
      return { ...data, available: "available" in data ? data.available : false };
    })(),
  );

  if (!parsed.success) return validationFailed(parsed.error);

  // The hero typewriter stores a JSON array; the form edits it as one line
  // per phrase, which is far easier to type than raw JSON.
  const taglines = JSON.stringify(
    parsed.data.taglines
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  );

  const previous = await prisma.profile.findUnique({
    where: { id: "singleton" },
    select: { avatarUrl: true, resumeUrl: true },
  });

  try {
    await prisma.profile.upsert({
      where: { id: "singleton" },
      update: { ...parsed.data, taglines },
      create: { ...parsed.data, taglines, id: "singleton" },
    });
  } catch (error) {
    console.error("updateProfile failed", error);
    return failure("Could not save your profile.");
  }

  await replaceUpload(previous?.avatarUrl, parsed.data.avatarUrl);
  await replaceUpload(previous?.resumeUrl, parsed.data.resumeUrl);

  // The OG image is prerendered from the profile, so purge it alongside the pages.
  for (const path of ["/", "/about", "/contact", "/admin/profile", "/opengraph-image"]) {
    revalidatePath(path);
  }

  return success("Profile saved.");
}
