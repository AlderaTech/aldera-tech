import { describe, expect, it } from "bun:test";

describe("Auth.js account boundary", () => {
  it("checks invitation eligibility and refreshes real callback permissions", () => {
    const script = `
      import {mock} from "bun:test";
      globalThis.fetch=async()=>{throw Error("Network disabled");};
      let config;
      let account={id:"fixture",name:"Fixture",email:"fixture@example.invalid",password:"fake-hash",avatar:null,roles:["ADMIN"],securityVersion:0,isActive:true,invitedAt:new Date(),phoneVerified:null};
      mock.module("next-auth",()=>({default:(c)=>{config=c;return{auth:async()=>null,handlers:{},signIn:async()=>{},signOut:async()=>{}};}}));
      mock.module("next-auth/providers/credentials",()=>({default:(c)=>c}));
      mock.module("bcryptjs",()=>({default:{compare:async()=>true}}));
      mock.module("@/lib/prisma",()=>({prisma:{user:{findUnique:async()=>account}}}));
      mock.module("@/lib/login-rate-limit",()=>({consumeLoginAttempt:async()=>true,clearLoginAttempts:async()=>{}}));
      await import("./auth.ts");
      const credentials={email:account.email,password:"fixture-password"};
      const request=new Request("http://localhost/api/auth/callback/credentials");
      const invited=await config.providers[0].authorize(credentials,request);
      let token=await config.callbacks.jwt({token:{},user:invited});
      account={...account,roles:["CLIENT"]};
      token=await config.callbacks.jwt({token});
      const demotedRole=token.role;
      account={...account,isActive:false};
      const disabled=await config.callbacks.jwt({token});
      account={...account,securityVersion:0,isActive:true,invitedAt:null};
      const unverified=await config.providers[0].authorize(credentials,request);
      console.log(JSON.stringify({invited:!!invited,demotedRole,disabled,unverified}));
    `;
    const child = Bun.spawnSync([process.execPath, "-e", script], {
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(child.exitCode).toBe(0);
    expect(JSON.parse(child.stdout.toString())).toEqual({
      invited: true,
      demotedRole: "CLIENT",
      disabled: null,
      unverified: null,
    });
  });
});
