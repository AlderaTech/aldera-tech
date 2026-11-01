import { AdminMascot } from "../../_components/admin-mascot";
import { ProposalCreateForm } from "../_components/proposal-create-form";

export default function NewProposalPage() {
  return (
    <div className="space-y-6">
      <div
        data-admin-page-header
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Proposal Baru</h1>
          <p className="text-muted-foreground">
            Buat proposal dengan line item, link review, dan e-signature client.
          </p>
        </div>
        <AdminMascot pose="contact" size="header" />
      </div>
      <ProposalCreateForm />
    </div>
  );
}
