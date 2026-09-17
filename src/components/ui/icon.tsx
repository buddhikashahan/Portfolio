import {
  Award,
  BrainCircuit,
  Briefcase,
  Boxes,
  Cloud,
  Code,
  Cpu,
  Database,
  FileCode,
  Component,
  Gauge,
  GitBranch,
  Globe,
  GraduationCap,
  Layers,
  LayoutDashboard,
  LineChart,
  Lock,
  Monitor,
  Palette,
  PenTool,
  Plug,
  Rocket,
  Server,
  Shield,
  Smartphone,
  Sparkles,
  Terminal,
  Zap,
  Workflow,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/**
 * Icons are stored in the database as plain strings so they can be chosen from
 * the admin UI. Anything unrecognised falls back to a neutral glyph rather than
 * crashing the page.
 */
export const iconRegistry = {
  Award,
  BrainCircuit,
  Briefcase,
  Boxes,
  Cloud,
  Code,
  Cpu,
  Database,
  FileCode,
  Component,
  Gauge,
  GitBranch,
  Globe,
  GraduationCap,
  Layers,
  LayoutDashboard,
  LineChart,
  Lock,
  Monitor,
  Palette,
  PenTool,
  Plug,
  Rocket,
  Server,
  Shield,
  Smartphone,
  Sparkles,
  Terminal,
  Zap,
  Workflow,
  Wrench,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof iconRegistry;

export const iconNames = Object.keys(iconRegistry) as IconName[];

export function DynamicIcon({
  name,
  className,
}: {
  name: string | null | undefined;
  className?: string;
}) {
  // Direct lookup in the frozen registry — never a newly created component.
  const Icon = name && name in iconRegistry ? iconRegistry[name as IconName] : Sparkles;
  return <Icon className={className} aria-hidden />;
}

