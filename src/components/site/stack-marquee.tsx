import { TechIcon } from "@/components/ui/tech-icon";
import type { SkillCategoryWithSkills } from "@/types/content";

/**
 * Continuous logo rail under the hero — the "at a glance" version of the stack
 * before the reader reaches the grouped grid further down.
 *
 * The list is rendered twice and the track translates by exactly -50%, which is
 * what makes the loop seamless. The duplicate is hidden from assistive tech so
 * the logos are not announced twice.
 */
export function StackMarquee({
  categories,
}: {
  categories: SkillCategoryWithSkills[];
}) {
  const logos = categories
    .flatMap((category) => category.skills)
    .filter((skill) => skill.icon)
    .slice(0, 24);

  if (logos.length < 6) return null;

  return (
    <div className="border-b border-hairline py-8">
      <div className="mask-fade-x overflow-hidden">
        <div className="animate-marquee flex w-max items-center gap-12 hover:[animation-play-state:paused]">
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-hidden={copy === 1}
              className="flex shrink-0 items-center gap-12"
            >
              {logos.map((skill) => (
                <li
                  key={`${copy}-${skill.id}`}
                  className="flex items-center gap-2.5 text-ink-subtle transition-colors hover:text-ink"
                >
                  <TechIcon slug={skill.icon} className="size-5 shrink-0" />
                  <span className="text-sm whitespace-nowrap">{skill.name}</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}
