import { expect, it } from "bun:test";

it("does not resurrect unpublished fallback slugs or repeat the first blog page", () => {
  const script = `import{mock}from'bun:test';import assert from'node:assert/strict';
    mock.module('@/lib/prisma',()=>({prisma:{blogPost:{findMany:async()=>[],findFirst:async()=>null},caseStudy:{findMany:async()=>[],findFirst:async()=>null}}}));
    const {getBlogList}=await import('./app/(public)/blog/_data/blog-list.ts');const {getBlogDetailPost}=await import('./app/(public)/blog/[slug]/_data/blog-detail.ts');
    const {getPortfolioItem,getPortfolioItems}=await import('./app/(public)/portfolio/_data/portfolio.ts');
    assert.deepEqual(await getBlogList({page:2}),[]);assert.equal(await getBlogDetailPost('kenapa-bisnis-anda-butuh-website-modern'),null);assert.equal(await getPortfolioItem('technova-b2b-platform'),null);assert.deepEqual(await getPortfolioItems(),[]);`;
  const result = Bun.spawnSync(
    [process.execPath, "--no-env-file", "-e", script],
    { stdout: "pipe", stderr: "pipe" }
  );
  if (result.exitCode) throw new Error(result.stderr.toString());
  expect(result.exitCode).toBe(0);
});
