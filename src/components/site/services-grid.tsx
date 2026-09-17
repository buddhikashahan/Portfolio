import { Stagger, StaggerItem } from "@/components/motion";
import { DynamicIcon } from "@/components/ui/icon";
import type { Service } from "@/types/content";

export function ServicesGrid({ services }: { services: Service[] }) {
  if (services.length === 0) return null;

  return (
    <Stagger
      className="grid divide-y divide-[var(--hairline)] border-y border-hairline sm:grid-cols-2 sm:divide-x lg:grid-cols-3"
      stagger={0.06}
    >
      {services.map((service) => (
        <StaggerItem key={service.id} className="h-full">
          <div className="group h-full p-6 transition-colors duration-200 hover:bg-surface sm:p-8">
            <span className="inline-grid size-10 place-items-center rounded-lg border border-hairline bg-surface text-ink-muted transition-colors group-hover:border-accent/40 group-hover:text-accent">
              <DynamicIcon name={service.icon} className="size-4.5" />
            </span>
            <h3 className="mt-5 font-medium text-ink">{service.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {service.description}
            </p>
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
