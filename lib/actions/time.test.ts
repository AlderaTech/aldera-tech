import { expect, it } from "bun:test";
import { manualTimeEntrySchema } from "@/lib/validations/time-entry";

it("rejects invalid, non-finite, zero and overflowing durations", () => {
  for (const minutes of ["abc", "Infinity", "NaN", -1, 0, Number.MAX_VALUE])
    expect(
      manualTimeEntrySchema.safeParse({
        minutes,
        description: "Fixture",
        billable: true,
      }).success
    ).toBe(false);
  expect(
    manualTimeEntrySchema.safeParse({
      minutes: 30,
      description: "Fixture",
      billable: true,
    }).success
  ).toBe(true);
});

it("rolls back time entries when their activity log fails", () => {
  const script = `import{mock}from'bun:test';import assert from'node:assert/strict';
    mock.module('@/auth',()=>({auth:async()=>({user:{id:'fixture',role:'ADMIN'}})}));mock.module('next/cache',()=>({revalidatePath:()=>{}}));
    let stored=0;mock.module('@/lib/prisma',()=>({prisma:{$transaction:async(fn)=>{const before=stored;try{return await fn({timeEntry:{create:async()=>{stored++;}},activityLog:{create:async()=>{throw Error('fixture log failure');}}});}catch(e){stored=before;throw e;}}}}));
    const {addManualEntryAction}=await import('./lib/actions/time.ts');const fd=new FormData();fd.set('description','Fixture');fd.set('minutes','30');const result=await addManualEntryAction('fixture',fd);assert.equal(result.ok,false);assert.equal(stored,0);`;
  const result = Bun.spawnSync(
    [process.execPath, "--no-env-file", "-e", script],
    { stdout: "pipe", stderr: "pipe" }
  );
  if (result.exitCode) throw new Error(result.stderr.toString());
  expect(result.exitCode).toBe(0);
});
