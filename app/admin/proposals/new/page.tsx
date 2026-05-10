import { ProposalCreateForm } from "../_components/proposal-create-form";

export default function NewProposalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Proposal Baru</h1>
        <p className="text-muted-foreground">
          Buat proposal dengan line item, link review, dan e-signature client.
        </p>
      </div>
      <ProposalCreateForm />
    </div>
  );
}
