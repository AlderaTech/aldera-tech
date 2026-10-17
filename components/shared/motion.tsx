"use client";

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";
import * as React from "react";
import { cn } from "@/lib/utils";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

export function FadeUp({
  children,
  delay = 0,
  className,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        ...fadeUp,
        show: {
          ...(fadeUp.show as object),
          transition: {
            duration: shouldReduceMotion ? 0 : 0.5,
            ease: "easeOut",
            delay: shouldReduceMotion ? 0 : delay,
          },
        },
      }}
      className={cn(
        "motion-reduce:transform-none! motion-reduce:opacity-100!",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className,
  ...props
}: HTMLMotionProps<"div">) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      variants={
        shouldReduceMotion
          ? {
              hidden: {},
              show: { transition: { staggerChildren: 0, delayChildren: 0 } },
            }
          : stagger
      }
      className={cn(
        "motion-reduce:transform-none! motion-reduce:opacity-100!",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  ...props
}: HTMLMotionProps<"div">) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={
        shouldReduceMotion
          ? {
              ...fadeUp,
              show: { opacity: 1, y: 0, transition: { duration: 0 } },
            }
          : fadeUp
      }
      className={cn(
        "motion-reduce:transform-none! motion-reduce:opacity-100!",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
