import {
  siAndroid,
  siApple,
  siBootstrap,
  siC,
  siCloudflare,
  siCplusplus,
  siCss,
  siDart,
  siDjango,
  siDocker,
  siElectron,
  siEslint,
  siExpress,
  siFigma,
  siFirebase,
  siFlutter,
  siFramer,
  siGit,
  siGithub,
  siGo,
  siGraphql,
  siHtml5,
  siJavascript,
  siJest,
  siKotlin,
  siLaravel,
  siLinux,
  siMongodb,
  siMysql,
  siNextdotjs,
  siNginx,
  siNodedotjs,
  siNumpy,
  siPandas,
  siPhp,
  siPostgresql,
  siPostman,
  siPrisma,
  siPython,
  siPytorch,
  siReact,
  siRedis,
  siRust,
  siSass,
  siScikitlearn,
  siSpringboot,
  siStripe,
  siSupabase,
  siSvelte,
  siSwift,
  siTailwindcss,
  siTensorflow,
  siThreedotjs,
  siTypescript,
  siVercel,
  siVite,
  siVitest,
  siVuedotjs,
  siWebpack,
} from "simple-icons";

import { cn } from "@/lib/utils";

type Brand = { title: string; hex: string; path: string };

/**
 * Curated brand registry. Icons are imported by name rather than looked up off
 * the whole `simple-icons` package so the bundler can tree-shake the other
 * ~3,400 logos out.
 *
 * Keys are the values stored in `Skill.icon` / `Service.icon`, so they double
 * as the options in the dashboard's icon picker.
 */
export const techRegistry = {
  react: siReact,
  nextdotjs: siNextdotjs,
  typescript: siTypescript,
  javascript: siJavascript,
  tailwindcss: siTailwindcss,
  html5: siHtml5,
  css: siCss,
  sass: siSass,
  bootstrap: siBootstrap,
  vuedotjs: siVuedotjs,
  svelte: siSvelte,
  framer: siFramer,
  threedotjs: siThreedotjs,

  nodedotjs: siNodedotjs,
  express: siExpress,
  python: siPython,
  django: siDjango,
  springboot: siSpringboot,
  laravel: siLaravel,
  php: siPhp,
  graphql: siGraphql,
  nginx: siNginx,

  postgresql: siPostgresql,
  mongodb: siMongodb,
  mysql: siMysql,
  prisma: siPrisma,
  redis: siRedis,
  supabase: siSupabase,
  firebase: siFirebase,

  flutter: siFlutter,
  dart: siDart,
  electron: siElectron,
  android: siAndroid,
  apple: siApple,
  kotlin: siKotlin,
  swift: siSwift,

  tensorflow: siTensorflow,
  pytorch: siPytorch,
  pandas: siPandas,
  numpy: siNumpy,
  scikitlearn: siScikitlearn,

  docker: siDocker,
  git: siGit,
  github: siGithub,
  vercel: siVercel,
  cloudflare: siCloudflare,
  figma: siFigma,
  postman: siPostman,
  vite: siVite,
  vitest: siVitest,
  jest: siJest,
  webpack: siWebpack,
  eslint: siEslint,
  linux: siLinux,
  stripe: siStripe,

  go: siGo,
  rust: siRust,
  c: siC,
  cplusplus: siCplusplus,
} satisfies Record<string, Brand>;

export type TechSlug = keyof typeof techRegistry;

export const techSlugs = Object.keys(techRegistry) as TechSlug[];

export function getBrand(slug: string | null | undefined): Brand | null {
  if (slug && slug in techRegistry) {
    return techRegistry[slug as TechSlug];
  }
  return null;
}

/**
 * Brand mark. Renders in `currentColor` by default so it sits quietly in a
 * list; pass `colored` to paint it in the official brand colour.
 */
export function TechIcon({
  slug,
  className,
  colored = false,
  title,
}: {
  slug: string | null | undefined;
  className?: string;
  colored?: boolean;
  title?: string;
}) {
  const brand = getBrand(slug);

  if (!brand) return null;

  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      className={className}
      fill={colored ? `#${brand.hex}` : "currentColor"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <path d={brand.path} />
    </svg>
  );
}

/**
 * Square tile used in the stack grid: monochrome at rest, brand colour on
 * hover. Brands with no Simple Icons entry (Java, AWS, OpenAI — all trademark
 * restricted) fall back to a monogram so the grid never shows a hole.
 */
export function TechTile({
  slug,
  label,
  className,
}: {
  slug: string | null | undefined;
  label: string;
  className?: string;
}) {
  const brand = getBrand(slug);

  return (
    <div
      className={cn(
        "group/tile flex flex-col items-center justify-center gap-2.5 rounded-card border border-hairline bg-surface px-3 py-5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-hairline-strong hover:bg-surface-raised",
        className,
      )}
    >
      {brand ? (
        <svg
          viewBox="0 0 24 24"
          className="size-7 text-ink-subtle transition-colors duration-200 group-hover/tile:[fill:var(--brand)]"
          style={{ "--brand": `#${brand.hex}` } as React.CSSProperties}
          fill="currentColor"
          aria-hidden
        >
          <path d={brand.path} />
        </svg>
      ) : (
        <span
          aria-hidden
          className="grid size-7 place-items-center rounded-md border border-hairline font-mono text-[0.7rem] font-semibold text-ink-subtle transition-colors group-hover/tile:text-ink"
        >
          {label.slice(0, 2).toUpperCase()}
        </span>
      )}
      <span className="text-xs font-medium text-ink-muted transition-colors group-hover/tile:text-ink">
        {label}
      </span>
    </div>
  );
}
