import { z } from "zod";

export const relayCompletionSchema = z.object({
  choices: z
    .array(
      z.object({ message: z.object({ content: z.string().trim().min(1) }) })
    )
    .min(1),
  usage: z.object({
    prompt_tokens: z.number().int().min(0).max(2147483647),
    completion_tokens: z.number().int().min(0).max(2147483647),
  }),
});
