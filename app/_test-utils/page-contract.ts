import { expect } from "bun:test";
export function verifyPageContract(
  modulePath: string,
  canonical?: string,
  {
    protectedPage = false,
    missing = false,
  }: { protectedPage?: boolean; missing?: boolean } = {}
) {
  const script = `import{mock}from'bun:test';import React from'react';import{renderToStaticMarkup}from'react-dom/server';import assert from'node:assert/strict';
 mock.module('server-only',()=>({}));
 mock.module('@/auth',()=>({auth:async()=>null,signIn:async()=>{},signOut:async()=>{}}));
 const navigation={redirect:(url)=>{throw Error('REDIRECT:'+url)},notFound:()=>{throw Error('NOT_FOUND')},useRouter:()=>({replace:()=>{},push:()=>{},refresh:()=>{}}),usePathname:()=>'/fixture',useSearchParams:()=>new URLSearchParams(),useParams:()=>({})};mock.module('next/navigation',()=>navigation);
 mock.module('next/image',()=>({default:({src,alt,width,height,className})=>React.createElement('img',{src:typeof src==='string'?src:src?.src,alt:alt??'',width,height,className})}));
 const query=new Proxy({}, {get:(_target,method)=>async()=>method==='count'?0:method==='findUnique'||method==='findFirst'?null:method==='aggregate'?{_sum:{total:0},_count:{_all:0}}:[]});
 mock.module('@/lib/prisma',()=>({prisma:new Proxy({}, {get:()=>query})}));
 async function resolve(node){if(!React.isValidElement(node))return node;if(typeof node.type==='function'&&node.type.constructor.name==='AsyncFunction')return resolve(await node.type(node.props));if(node.props?.children){const children=await Promise.all(React.Children.toArray(node.props.children).map(resolve));return React.cloneElement(node,{},...children)}return node}
 const page=await import(${JSON.stringify(modulePath)});assert.equal(typeof page.default,'function');
 if(page.metadata){assert.ok(page.metadata.title);assert.ok(page.metadata.description);${canonical ? `assert.equal(page.metadata.alternates?.canonical,${JSON.stringify(canonical)});` : ""}}
 try{const element=await page.default({params:Promise.resolve({slug:'missing-fixture',token:'missing-fixture'}),searchParams:Promise.resolve({page:'NaN',q:'fixture'})});${missing || protectedPage ? `assert.fail('Expected missing/auth boundary');` : `const html=renderToStaticMarkup(await resolve(element));assert.ok(html.length>30);assert.ok(!html.includes('[object Object]'));assert.ok(!html.includes('NaN'));`}}
 catch(error){${missing ? `assert.equal(error.message,'NOT_FOUND');` : protectedPage ? `assert.ok(error.message.startsWith('REDIRECT:'));` : `throw error;`}}
 process.exit(0);
 `;
  const result = Bun.spawnSync(
    [process.execPath, "--no-env-file", "-e", script],
    { stdout: "pipe", stderr: "pipe" }
  );
  if (result.exitCode) throw new Error(result.stderr.toString());
  expect(result.exitCode).toBe(0);
}
