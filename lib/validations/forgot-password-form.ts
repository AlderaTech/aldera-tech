import { z } from "zod";

// Preserve the existing form's email check; the server schema remains authoritative.
export const forgotPasswordEmailSchema = z
  .string()
  .trim()
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Format email tidak valid");
