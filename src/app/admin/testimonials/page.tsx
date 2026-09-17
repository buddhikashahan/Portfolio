import { AdminPageHeader } from "@/components/admin/page-header";
import { TestimonialsManager } from "@/components/admin/sections/testimonials-manager";
import { requireAdmin } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";

export default async function AdminTestimonialsPage() {
  await requireAdmin();

  const testimonials = await prisma.testimonial.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Testimonials"
        description="Client quotes for the home page slider."
      />
      <TestimonialsManager testimonials={testimonials} />
    </div>
  );
}
