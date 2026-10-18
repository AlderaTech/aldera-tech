"use client";

import { useEffect, useRef } from "react";

/** Move keyboard focus to the new stage without changing calculator state. */
export function useCalculatorStepFocus(step: number, enabled: boolean) {
  const stageRef = useRef<HTMLElement>(null);
  const previousStep = useRef(step);

  useEffect(() => {
    if (enabled && previousStep.current !== step) {
      stageRef.current?.focus({ preventScroll: true });
      stageRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
    }
    previousStep.current = step;
  }, [step, enabled]);

  return stageRef;
}
