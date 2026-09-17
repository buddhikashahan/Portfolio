"use client";

import { AdminForm, FormSection } from "@/components/admin/admin-form";
import { UploadField } from "@/components/admin/upload-field";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/field";
import { updateProfile } from "@/lib/actions/content";
import { parseJsonArray } from "@/lib/utils";
import type { Profile } from "@/types/content";

export function ProfileForm({ profile }: { profile: Profile | null }) {
  // The typewriter phrases are stored as JSON but edited one per line.
  const taglines = parseJsonArray(profile?.taglines).join("\n");

  return (
    <AdminForm action={updateProfile} submitLabel="Save profile">
      {(state) => (
        <>
          <FormSection
            title="Identity"
            description="Drives the hero, the about page and page titles across the site."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" htmlFor="fullName" required error={state.errors?.fullName}>
                <Input
                  id="fullName"
                  name="fullName"
                  required
                  defaultValue={profile?.fullName}
                  invalid={Boolean(state.errors?.fullName)}
                />
              </Field>

              <Field
                label="Headline"
                htmlFor="headline"
                required
                hint="e.g. Full-Stack Developer · AI/ML Engineer"
                error={state.errors?.headline}
              >
                <Input
                  id="headline"
                  name="headline"
                  required
                  defaultValue={profile?.headline}
                  invalid={Boolean(state.errors?.headline)}
                />
              </Field>
            </div>

            <Field
              label="Tagline"
              htmlFor="tagline"
              required
              hint="The sentence under your name in the hero."
              error={state.errors?.tagline}
            >
              <Textarea
                id="tagline"
                name="tagline"
                rows={2}
                required
                defaultValue={profile?.tagline}
                invalid={Boolean(state.errors?.tagline)}
              />
            </Field>

            <Field
              label="Rotating phrases"
              htmlFor="taglines"
              hint="One per line. These cycle beneath the hero tagline."
            >
              <Textarea
                id="taglines"
                name="taglines"
                rows={5}
                defaultValue={taglines}
                className="font-mono text-xs"
                placeholder={"Full-Stack Development\nAPI Design\nCloud Integration"}
              />
            </Field>

            <Field
              label="Bio"
              htmlFor="bio"
              required
              hint="Blank lines separate paragraphs on the about page."
              error={state.errors?.bio}
            >
              <Textarea
                id="bio"
                name="bio"
                rows={9}
                required
                defaultValue={profile?.bio}
                invalid={Boolean(state.errors?.bio)}
              />
            </Field>
          </FormSection>

          <FormSection
            title="Portrait & CV"
            description="Uploaded files are served from this site. Replacing one removes the old file when you save."
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Portrait" htmlFor="avatarUrl" error={state.errors?.avatarUrl}>
                <UploadField
                  id="avatarUrl"
                  name="avatarUrl"
                  aspect="portrait"
                  defaultValue={profile?.avatarUrl}
                  hint="A 4:5 crop works best in the hero."
                />
              </Field>

              <Field label="CV (PDF)" htmlFor="resumeUrl" error={state.errors?.resumeUrl}>
                <UploadField
                  id="resumeUrl"
                  name="resumeUrl"
                  kind="document"
                  defaultValue={profile?.resumeUrl}
                  hint="Adds Download CV buttons to the about page."
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            title="Contact & location"
            description="Shown on the about and contact pages. Keep it to what a client needs to work with you."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Email" htmlFor="email" required error={state.errors?.email}>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  defaultValue={profile?.email}
                  invalid={Boolean(state.errors?.email)}
                />
              </Field>

              <Field label="Location" htmlFor="location" hint="City, Country">
                <Input id="location" name="location" defaultValue={profile?.location ?? ""} />
              </Field>

              <Field label="Timezone" htmlFor="timezone" hint="e.g. GMT+5:30">
                <Input id="timezone" name="timezone" defaultValue={profile?.timezone ?? ""} />
              </Field>

              <Field label="Working languages" htmlFor="languages">
                <Input
                  id="languages"
                  name="languages"
                  defaultValue={profile?.languages ?? ""}
                  placeholder="English, Sinhala"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Social links">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="GitHub" htmlFor="githubUrl" error={state.errors?.githubUrl}>
                <Input
                  id="githubUrl"
                  name="githubUrl"
                  defaultValue={profile?.githubUrl ?? ""}
                  placeholder="https://github.com/…"
                  invalid={Boolean(state.errors?.githubUrl)}
                />
              </Field>

              <Field label="LinkedIn" htmlFor="linkedinUrl" error={state.errors?.linkedinUrl}>
                <Input
                  id="linkedinUrl"
                  name="linkedinUrl"
                  defaultValue={profile?.linkedinUrl ?? ""}
                  placeholder="https://linkedin.com/in/…"
                  invalid={Boolean(state.errors?.linkedinUrl)}
                />
              </Field>

              <Field label="WhatsApp" htmlFor="whatsappUrl" error={state.errors?.whatsappUrl}>
                <Input
                  id="whatsappUrl"
                  name="whatsappUrl"
                  defaultValue={profile?.whatsappUrl ?? ""}
                  placeholder="https://wa.me/…"
                  invalid={Boolean(state.errors?.whatsappUrl)}
                />
              </Field>

              <Field label="X / Twitter" htmlFor="twitterUrl" error={state.errors?.twitterUrl}>
                <Input
                  id="twitterUrl"
                  name="twitterUrl"
                  defaultValue={profile?.twitterUrl ?? ""}
                  placeholder="https://x.com/…"
                  invalid={Boolean(state.errors?.twitterUrl)}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            title="Availability & highlights"
            description="The figures on the hero portrait card."
          >
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Years of experience" htmlFor="yearsExperience">
                <Input
                  id="yearsExperience"
                  name="yearsExperience"
                  type="number"
                  min={0}
                  defaultValue={profile?.yearsExperience ?? 0}
                />
              </Field>
              <Field label="Projects delivered" htmlFor="projectsCount">
                <Input
                  id="projectsCount"
                  name="projectsCount"
                  type="number"
                  min={0}
                  defaultValue={profile?.projectsCount ?? 0}
                />
              </Field>
              <Field label="Clients" htmlFor="clientsCount">
                <Input
                  id="clientsCount"
                  name="clientsCount"
                  type="number"
                  min={0}
                  defaultValue={profile?.clientsCount ?? 0}
                />
              </Field>
            </div>

            <Checkbox
              name="available"
              label="Available for new work"
              description="Shows the availability indicator in the hero and on the about page."
              defaultChecked={profile?.available ?? true}
            />
          </FormSection>
        </>
      )}
    </AdminForm>
  );
}
