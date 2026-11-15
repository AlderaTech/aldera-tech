import { describe, it, expect } from "bun:test";
describe("Profile save feedback", () => {
  it("shows the confirmed server message when a changed phone needs verification", () => {
    const script = `import {mock} from "bun:test";import assert from "node:assert/strict";
   let work;const updates=[];let notification;
   mock.module("react",()=>({useEffect:()=>{},useState:value=>[value,value=>updates.push(value)],useRef:()=>({current:false}),useTransition:()=>[false,fn=>{work=fn();}]}));
   mock.module("sonner",()=>({toast:{success:message=>{notification=message;},error:()=>{}}}));
   mock.module("@/lib/actions/profile",()=>({updateProfile:async()=>({ok:true,message:"Profil disimpan. Verifikasi nomor baru.",requiresPhoneVerification:true})}));
   const {useProfileForm}=await import("./app/dashboard/profile/_hooks/use-profile-form.ts");
   const hook=useProfileForm({name:"Fixture",phone:"08123456789"});hook.handleSubmit(new FormData());await work;
   assert.equal(notification,"Profil disimpan. Verifikasi nomor baru.");assert.ok(updates.some(value=>value?.message===notification));
  `;
    const result = Bun.spawnSync([process.execPath, "-e", script], {
      stdout: "pipe",
      stderr: "pipe",
    });
    if (result.exitCode !== 0) throw new Error(result.stderr.toString());
    expect(result.exitCode).toBe(0);
  });
});
