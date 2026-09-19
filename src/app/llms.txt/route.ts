import {
  getProfile,
  getPublishedPostSlugs,
  getPublishedProjectSlugs,
} from "@/lib/queries";
import { siteConfig } from "@/lib/site-config";

/**
 * llms.txt (https://llmstxt.org/) — a short, structured summary for AI
 * crawlers and assistants, in the spirit of robots.txt/sitemap.xml for
 * search engines. Built from the same data as the sitemap so it never goes
 * stale when content changes from the dashboard.
 */
export async function GET() {
  const [profile, projects, posts] = await Promise.all([
    getProfile(),
    getPublishedProjectSlugs(),
    getPublishedPostSlugs(),
  ]);

  const lines = [
    `# ${siteConfig.name}`,
    "",
    `> ${profile?.headline ?? siteConfig.description}`,
    "",
    profile?.bio ?? siteConfig.description,
    "",
    "## Pages",
    "",
    `- [About](${siteConfig.url}/about): Background, experience, education and technical skills`,
    `- [Projects](${siteConfig.url}/projects): Case studies of shipped web, mobile and AI/ML work`,
    `- [Blog](${siteConfig.url}/blog): Notes on full-stack architecture and shipping real products`,
    `- [Contact](${siteConfig.url}/contact): Start a project conversation`,
  ];

  if (projects.length > 0) {
    lines.push("", "## Projects", "");
    for (const project of projects) {
      lines.push(`- [${project.slug}](${siteConfig.url}/projects/${project.slug})`);
    }
  }

  if (posts.length > 0) {
    lines.push("", "## Blog posts", "");
    for (const post of posts) {
      lines.push(`- [${post.slug}](${siteConfig.url}/blog/${post.slug})`);
    }
  }

  return new Response(lines.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
