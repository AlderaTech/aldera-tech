import { it } from "bun:test";
import { verifyPageContract } from "@/app/_test-utils/page-contract";
it(
  "renders the actual route with metadata and preserves missing/auth boundaries",
  () =>
    verifyPageContract("./app/(public)/blog/[slug]/page.tsx", undefined, {
      missing: true,
    }),
  20000
);
