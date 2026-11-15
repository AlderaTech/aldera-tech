import { describe, it, expect, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { PROPOSAL_ROUTES } from "@/lib/routes";
mock.module("next/navigation", () => ({
  useRouter: () => ({ refresh: mock(), push: mock() }),
}));
mock.module("@/lib/actions/proposal", () => ({
  convertProposalToProjectAction: mock(),
  deleteProposalAction: mock(),
  sendProposalAction: mock(),
}));
const { ProposalActions } = await import("./proposal-actions");
describe("Proposal conversion controls", () => {
  it("offers conversion for signed proposals and never exposes credentials on initial render", () => {
    const props = {
      proposalId: "proposal",
      publicUrl: PROPOSAL_ROUTES.publicDetail("fixture"),
      status: "SIGNED",
    };
    const html = renderToStaticMarkup(<ProposalActions {...props} />);
    expect(html).toContain("Convert ke Proyek");
    expect(html).not.toContain("Password sementara");
    expect(
      renderToStaticMarkup(
        <ProposalActions {...props} convertedProjectId="existing" />
      )
    ).not.toContain("Convert ke Proyek");
  });
});
