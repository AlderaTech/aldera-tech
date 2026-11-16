import { expect, it } from "bun:test";

it("allows exactly one of concurrent sign and reject decisions", () => {
  const script = `import {mock}from'bun:test';import assert from'node:assert/strict';
    mock.module('@/auth',()=>({auth:async()=>null}));mock.module('next/cache',()=>({revalidatePath:()=>{}}));mock.module('next/headers',()=>({headers:async()=>new Headers()}));
    const {prisma}=await import('./lib/prisma.ts');const {signProposalAction,rejectProposalAction}=await import('./lib/actions/proposal.ts');
    const user=await prisma.user.create({data:{email:crypto.randomUUID()+'@example.test',name:'Fixture',password:'not-live'}});
    const proposal=await prisma.proposal.create({data:{token:crypto.randomUUID(),number:crypto.randomUUID(),title:'Fixture',content:'Fixture',clientName:'Fixture',clientEmail:user.email,createdById:user.id,status:'SENT'}});
    try{const results=await Promise.all([signProposalAction(proposal.token,{signatureName:'Fixture',signatureDataUrl:'data:image/png;base64,AA=='}),rejectProposalAction(proposal.token)]);assert.equal(results.filter(r=>r.ok).length,1);const row=await prisma.proposal.findUniqueOrThrow({where:{id:proposal.id}});assert.ok(['SIGNED','REJECTED'].includes(row.status));}
    finally{await prisma.user.delete({where:{id:user.id}});await prisma.$disconnect();}`;
  const result = Bun.spawnSync(
    [process.execPath, "--no-env-file", "-e", script],
    { stdout: "pipe", stderr: "pipe" }
  );
  if (result.exitCode) throw new Error(result.stderr.toString());
  expect(result.exitCode).toBe(0);
}, 20_000);
