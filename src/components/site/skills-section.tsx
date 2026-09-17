import { Stagger, StaggerItem } from "@/components/motion";
import { DynamicIcon } from "@/components/ui/icon";
import { TechTile } from "@/components/ui/tech-icon";
import type { SkillCategoryWithSkills } from "@/types/content";

/**
 * The stack, grouped by discipline and shown as brand marks.
 *
 * Deliberately no proficiency percentages: a self-assigned "React 95%" is
 * unverifiable and reads as filler. What a reader actually wants is the shape
 * of the toolkit, which a logo grid communicates at a glance.
 */
export function SkillsSection({
  categories,
}: {
  categories: SkillCategoryWithSkills[];
}) {
  if (categories.length === 0) return null;

  return (
    <Stagger className="space-y-10" stagger={0.06}>
      {categories.map((category) => (
        <StaggerItem key={category.id}>
          <div className="grid gap-5 lg:grid-cols-[15rem_1fr] lg:gap-8">
            <div className="lg:pt-1">
              <h3 className="flex items-center gap-2.5 font-semibold text-ink">
                <span className="inline-grid size-8 shrink-0 place-items-center rounded-lg border border-hairline bg-surface text-ink-muted">
                  <DynamicIcon name={category.icon} className="size-4" />
                </span>
                {category.name}
              </h3>
              {category.description ? (
                <p className="mt-2 text-sm leading-relaxed text-ink-muted lg:pr-4">
                  {category.description}
                </p>
              ) : null}
            </div>

            <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
              {category.skills.map((skill) => (
                <li key={skill.id}>
                  <TechTile slug={skill.icon} label={skill.name} />
                </li>
              ))}
            </ul>
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

