import { AdminPageHeader } from "@/components/admin/page-header";
import { ServicesManager } from "@/components/admin/sections/services-manager";
import { requireAdmin } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";

export default async function AdminServicesPage() {
  await requireAdmin();

  const services = await prisma.service.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Services"
        description="The service cards shown on the home and about pages."
      />
      <ServicesManager services={services} />
    </div>
  );
}
