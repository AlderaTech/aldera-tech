import { describe, expect, it } from "bun:test";
import { AUTH_ROUTES } from "@/lib/routes";

describe("Registration recovery after OTP delivery failure", () => {
  for (const outcome of ["delivered", "delivery-failed", "invalid-input"]) {
    it(`handles ${outcome} without creating a second account`, () => {
      // A separate process isolates hook mocks from the React rendering suite.
      const script = `
        import {mock} from "bun:test";
        globalThis.fetch=async()=>{throw Error("Network disabled for UI test");};
        let pending; const events=[];
        const outcome=${JSON.stringify(outcome)};
        mock.module("react",()=>({useState:(value)=>[value,()=>{}],useTransition:()=>[false,(run)=>{pending=run();}]}));
        mock.module("next/navigation",()=>({useRouter:()=>({push:(url)=>events.push(["route",url])})}));
        mock.module("sonner",()=>({toast:{success:(message)=>events.push(["success",message]),error:(message)=>events.push(["error",message])}}));
        mock.module("@/lib/actions/auth",()=>({registerAction:async()=>({ok:outcome==="delivered",success:outcome==="delivered",requiresVerification:outcome!=="invalid-input",phone:"6281234567890",email:"fixture@example.invalid",message:"fixture-status"})}));
        const {useRegisterForm}=await import("./app/(auth)/register/_hooks/use-register-form.ts");
        useRegisterForm().handleSubmit(new FormData()); await pending;
        console.log(JSON.stringify(events));
      `;
      const child = Bun.spawnSync([process.execPath, "-e", script], {
        stdout: "pipe",
        stderr: "pipe",
      });
      expect(child.exitCode).toBe(0);
      const events = JSON.parse(child.stdout.toString()) as string[][];
      expect(events[0][0]).toBe(outcome === "delivered" ? "success" : "error");
      if (outcome === "invalid-input") expect(events).toHaveLength(1);
      else
        expect(events[1]).toEqual([
          "route",
          AUTH_ROUTES.verifyOtpWithPhone("6281234567890"),
        ]);
    });
  }
});
