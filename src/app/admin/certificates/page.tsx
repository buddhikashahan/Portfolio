import { AdminPageHeader } from "@/components/admin/page-header";
import { CertificatesManager } from "@/components/admin/sections/certificates-manager";
import { requireAdmin } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";

export default async function AdminCertificatesPage() {
  await requireAdmin();

  const certificates = await prisma.certificate.findMany({ orderBy: [{ order: "asc" }, { year: "desc" }] });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Certificates"
        description="Courses and credentials listed on the resume page."
      />
      <CertificatesManager certificates={certificates} />
    </div>
  );
}
