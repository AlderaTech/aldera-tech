import { expect, it } from "bun:test";

it("shares atomic limits, expires temporary counters, and clears only the signed-in account", () => {
  const script = `import assert from'node:assert/strict';import{createHmac}from'node:crypto';
    const {prisma}=await import('./lib/prisma.ts');const {consumeLoginAttempt,clearLoginAttempts}=await import('./lib/login-rate-limit.ts');
    const email=crypto.randomUUID()+'@example.test';const ip='fixture-'+crypto.randomUUID();
    const key=(kind,value)=>'login:'+kind+':'+createHmac('sha256',process.env.AUTH_SECRET).update(value).digest('hex');
    const accountKey=key('account',email),networkKey=key('network',ip);
    try{const attempts=await Promise.all(Array.from({length:15},()=>consumeLoginAttempt(email,ip)));assert.equal(attempts.filter(Boolean).length,10);
      assert.equal(await consumeLoginAttempt(email.toUpperCase(),ip),false);
      await prisma.authRateLimit.update({where:{key:accountKey},data:{resetAt:new Date(0)}});assert.equal(await consumeLoginAttempt(email,ip),true);
      await clearLoginAttempts(email);assert.equal(await prisma.authRateLimit.count({where:{key:accountKey}}),0);assert.equal(await prisma.authRateLimit.count({where:{key:networkKey}}),1);
    }finally{await prisma.authRateLimit.deleteMany({where:{key:{in:[accountKey,networkKey]}}});await prisma.$disconnect();}`;
  const result = Bun.spawnSync(
    [process.execPath, "--no-env-file", "-e", script],
    { stdout: "pipe", stderr: "pipe" }
  );
  if (result.exitCode) throw new Error(result.stderr.toString());
  expect(result.exitCode).toBe(0);
}, 20_000);

it("applies the additive login migration repeatedly without losing counters", () => {
  const script = `import{readFileSync}from'node:fs';import{Client}from'pg';import assert from'node:assert/strict';
    const db=new Client({connectionString:process.env.DATABASE_URL});await db.connect();
    const sql=readFileSync('prisma/migrations/20261116010000_auth_login_limits/migration.sql','utf8'),key='migration-fixture-'+crypto.randomUUID();
    try {await db.query('INSERT INTO "AuthRateLimit" (key,attempts,"resetAt","updatedAt") VALUES ($1,2,NOW(),NOW())',[key]);await db.query(sql);await db.query(sql);const row=await db.query('SELECT attempts FROM "AuthRateLimit" WHERE key=$1',[key]);assert.equal(row.rows[0].attempts,2);}
    finally {await db.query('DELETE FROM "AuthRateLimit" WHERE key=$1',[key]);await db.end();}`;
  const result = Bun.spawnSync(
    [process.execPath, "--no-env-file", "-e", script],
    { stdout: "pipe", stderr: "pipe" }
  );
  if (result.exitCode) throw new Error(result.stderr.toString());
  expect(result.exitCode).toBe(0);
}, 20_000);
