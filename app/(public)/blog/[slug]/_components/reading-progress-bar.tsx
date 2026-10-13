"use client";

import * as React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export function ReadingProgressBar() {
  const { scrollYProgress } = useScroll();
  const smoothed = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.3,
  });
  return (
    <motion.div
      aria-hidden
      className="fixed top-0 right-0 left-0 z-50 h-0.5 origin-left bg-primary"
      style={{ scaleX: smoothed }}
    />
  );
}
