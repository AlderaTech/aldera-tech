import { describe, expect, it } from "bun:test";

describe("Snap invoice concurrency regressions", () => {
  it("blocks drafts, reuses sessions, and rejects a stale provider response", () => {
    const script = `import {mock} from 'bun:test';import assert from 'node:assert/strict';
      mock.module('@/auth',()=>({auth:async()=>({user:{id:user.id,role:'CLIENT'}})}));
      mock.module('next/cache',()=>({revalidatePath:()=>{}}));
      const {prisma}=await import('./lib/prisma.ts');
      let calls=0,changeStatus=false;
      mock.module('@/lib/midtrans',()=>({createMidtransSnapTransaction:async()=>{calls++;if(changeStatus)await prisma.invoice.update({where:{id:invoice.id},data:{status:'PAID'}});return{token:'fixture-snap-'+crypto.randomUUID(),redirectUrl:'https://example.test/snap'};}}));
      const {createInvoicePaymentSnapAction}=await import('./lib/actions/payment.ts');
      const user=await prisma.user.create({data:{email:crypto.randomUUID()+'@example.test',name:'Fixture',password:'not-live',roles:['CLIENT']}});
      const invoice=await prisma.invoice.create({data:{number:'AUDIT-'+crypto.randomUUID(),clientId:user.id,dueDate:new Date(),total:100000,subtotal:100000,status:'DRAFT'}});
      try{
        assert.equal((await createInvoicePaymentSnapAction(invoice.id)).ok,false);assert.equal(calls,0);
        await prisma.invoice.update({where:{id:invoice.id},data:{status:'SENT'}});
        const first=await createInvoicePaymentSnapAction(invoice.id);assert.equal(first.ok,true);
        const again=await createInvoicePaymentSnapAction(invoice.id);assert.equal(again.token,first.token);assert.equal(calls,1);
        await prisma.payment.deleteMany({where:{invoiceId:invoice.id}});changeStatus=true;
        const race=await createInvoicePaymentSnapAction(invoice.id);assert.equal(race.ok,false);assert.equal(race.token,undefined);
        assert.equal(await prisma.payment.count({where:{invoiceId:invoice.id,status:'PENDING'}}),0);
      }finally{await prisma.user.delete({where:{id:user.id}});await prisma.$disconnect();}`;
    const result = Bun.spawnSync(
      [process.execPath, "--no-env-file", "-e", script],
      { stdout: "pipe", stderr: "pipe" }
    );
    if (result.exitCode) throw new Error(result.stderr.toString());
    expect(result.exitCode).toBe(0);
  }, 20_000);

  it("reserves only one provider attempt under concurrent requests", () => {
    const script = `import {mock}from'bun:test';import assert from'node:assert/strict';
      const {prisma}=await import('./lib/prisma.ts');const {reserveInvoiceSnap,failInvoiceSnap}=await import('./lib/invoice-snap-session.ts');
      const user=await prisma.user.create({data:{email:crypto.randomUUID()+'@example.test',name:'Fixture',password:'not-live'}});
      const inv=await prisma.invoice.create({data:{number:'AUDIT-'+crypto.randomUUID(),clientId:user.id,dueDate:new Date(),total:100,subtotal:100,status:'SENT'}});
      try{const results=await Promise.all([reserveInvoiceSnap(inv.id,user),reserveInvoiceSnap(inv.id,user)]);assert.equal(results.filter(r=>r.kind==='reserved').length,1);assert.equal(results.filter(r=>r.kind==='error').length,1);const reserved=results.find(r=>r.kind==='reserved');await failInvoiceSnap(reserved.paymentId);assert.equal((await reserveInvoiceSnap(inv.id,user)).kind,'reserved');}
      finally{await prisma.user.delete({where:{id:user.id}});await prisma.$disconnect();}`;
    const result = Bun.spawnSync(
      [process.execPath, "--no-env-file", "-e", script],
      { stdout: "pipe", stderr: "pipe" }
    );
    if (result.exitCode) throw new Error(result.stderr.toString());
    expect(result.exitCode).toBe(0);
  }, 20_000);
});
