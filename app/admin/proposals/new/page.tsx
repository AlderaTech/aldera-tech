import { AdminBanner } from "@/app/admin/_components/admin-banner";
import { AdminMascot } from "../../_components/admin-mascot";
import { ProposalCreateForm } from "../_components/proposal-create-form";

export default function NewProposalPage() {
  return (
    <div className="space-y-6">
      <AdminBanner
        data-admin-page-header
        className="flex flex-wrap items-center justify-between gap-4"
        category="projects"
        mascot={<AdminMascot pose="contact" size="header" />}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Proposal Baru</h1>
          <p className="text-muted-foreground">
            Susun rincian proposal, tautan peninjauan, dan tanda tangan
            elektronik untuk klien.
          </p>
        </div>
      </AdminBanner>
      <ProposalCreateForm />
    </div>
  );
}
