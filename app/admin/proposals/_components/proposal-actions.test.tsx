import { describe, it, expect, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { PROPOSAL_ROUTES } from "@/lib/routes";
if (process.env.ALDERA_UI_BOUNDARY_TEST_ISOLATED === "1") {
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
} else {
  describe("Isolated UI boundary", () => {
    it("checks rendering without replacing other components or actions", () => {
      const child = Bun.spawnSync(
        [process.execPath, "test", import.meta.path],
        {
          env: { ...process.env, ALDERA_UI_BOUNDARY_TEST_ISOLATED: "1" },
          stdout: "pipe",
          stderr: "pipe",
        }
      );
      if (child.exitCode !== 0)
        throw new Error(child.stderr.toString() + child.stdout.toString());
      expect(child.exitCode).toBe(0);
    });
  });
}
