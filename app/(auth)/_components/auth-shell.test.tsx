import { expect, it } from "bun:test";

it("keeps the mascot before the form, a single h1, and the existing login route", () => {
  const script = `import{mock}from'bun:test';import React from'react';import{renderToStaticMarkup}from'react-dom/server';import assert from'node:assert/strict';
    mock.module('next/image',()=>({default:({alt=''})=>React.createElement('img',{alt})}));
    const {AuthShell}=await import('./app/(auth)/_components/auth-shell.tsx');const {AUTH_ROUTES}=await import('./lib/routes.ts');
    const html=renderToStaticMarkup(React.createElement(AuthShell,{eyebrow:'Verifikasi',title:'Lengkapi akun Anda',description:'Masukkan kode.',variant:'register'},React.createElement('form',null,React.createElement('input',{name:'token',placeholder:'123456'}))));
    assert.equal((html.match(/<h1/g)||[]).length,1);assert.ok(html.indexOf('<aside')<html.indexOf('<form'));assert.ok(html.includes('href="'+AUTH_ROUTES.login+'"'));assert.ok(html.includes('name="token"'));`;
  const result = Bun.spawnSync(
    [process.execPath, "--no-env-file", "-e", script],
    { stdout: "pipe", stderr: "pipe" }
  );
  if (result.exitCode) throw new Error(result.stderr.toString());
  expect(result.exitCode).toBe(0);
});
