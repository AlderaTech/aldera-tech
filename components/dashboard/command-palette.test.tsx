import { describe, expect, it } from "bun:test";

describe("Command palette search states", () => {
  for (const state of ["loading", "empty", "error", "results"]) {
    it(`renders ${state} with accessible feedback and working retry`, () => {
      const script = `import {mock} from "bun:test";import assert from "node:assert/strict";import * as React from "react";import {renderToStaticMarkup} from "react-dom/server";
        const actual={...React};mock.module("react",()=>({...actual,useState:value=>[typeof value==="boolean"?true:"audit",()=>{}],useEffect:()=>{}}));
        mock.module("next/navigation",()=>({useRouter:()=>({push:()=>{}})}));
        const div=({children})=>React.createElement("div",null,children);
        mock.module("@/components/ui/command",()=>({CommandDialog:div,CommandInput:()=>React.createElement("input",{"aria-label":"Cari"}),CommandList:div,CommandGroup:div,CommandEmpty:div,CommandItem:({children,onSelect})=>React.createElement("button",{onClick:onSelect},children)}));
        let retries=0;const state=${JSON.stringify(state)};
        mock.module("@/components/dashboard/_hooks/use-command-search",()=>({useCommandSearch:()=>({loading:state==="loading",error:state==="error"?"Pencarian belum tersedia.":null,results:state==="results"?Array.from({length:20},(_,index)=>({kind:"project",id:"fixture-"+index,title:"Proyek fixture "+index,href:"/dashboard/projects"})):[],retry:()=>{retries++;}})}));
        const {CommandPalette}=await import("./components/dashboard/command-palette.tsx");const element=CommandPalette({role:"CLIENT"});const html=renderToStaticMarkup(element);
        if(state==="loading")assert.ok(html.includes("Mencari"));
        if(state==="empty")assert.ok(html.includes("Tidak ada hasil"));
        if(state==="error"){
          assert.ok(html.includes('role="alert"'));assert.ok(html.includes("Coba lagi"));assert.ok(!html.includes("Tidak ada hasil"));
          const visit=node=>{if(!node||typeof node!=="object")return;if(node.type==="button"&&node.props.children==="Coba lagi")node.props.onClick();React.Children.forEach(node.props?.children,visit);};visit(element);assert.equal(retries,1);
        }
        if(state==="results")assert.ok(html.includes("Proyek fixture 19"));
      `;
      const result = Bun.spawnSync([process.execPath, "-e", script]);
      if (result.exitCode) throw new Error(result.stderr.toString());
      expect(result.exitCode).toBe(0);
    });
  }
});
