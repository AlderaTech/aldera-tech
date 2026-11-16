import { expect, it } from "bun:test";

it("distinguishes router database failures from an unbound account", () => {
  const script = `import{mock}from'bun:test';import assert from'node:assert/strict';mock.module('@/auth',()=>({auth:async()=>({user:{id:'fixture'}})}));mock.module('@/lib/actions/ai-relay',()=>({ensureRouterUser:async()=>{}}));mock.module('@/lib/router-db',()=>({queryRouter:async()=>{throw Error('fixture database unavailable');}}));const {getBindingStatusAction}=await import('./lib/actions/binding.ts');const result=await getBindingStatusAction();assert.equal(result.isBound,false);assert.equal(typeof result.error,'string');`;
  const result = Bun.spawnSync(
    [process.execPath, "--no-env-file", "-e", script],
    { stdout: "pipe", stderr: "pipe" }
  );
  if (result.exitCode) throw new Error(result.stderr.toString());
  expect(result.exitCode).toBe(0);
});
