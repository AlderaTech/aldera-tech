import { z } from "zod";

export const serviceAvailabilitySchema = z.object({
  service: z.enum(["ai_router", "telegram_bot"]),
  enabled: z.boolean(),
});

export const telegramFileSchema = z.object({
  ok: z.literal(true),
  result: z.object({ file_path: z.string() }),
});

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
