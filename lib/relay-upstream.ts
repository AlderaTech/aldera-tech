import { relayCompletionSchema } from "@/lib/validations/relay";

export async function requestRelayCompletion(
  model: string,
  prompt: string,
  systemPrompt?: string
) {
  const base = (
    process.env.NINE_ROUTER_BASE_URL || "http://localhost:20128"
  ).replace(/\/+$/, "");
  const key = process.env.NINE_ROUTER_API_KEY?.trim();
  try {
    const response = await fetch(`${base}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(key ? { Authorization: `Bearer ${key}` } : {}),
      },
      body: JSON.stringify({
        model,
        messages: [
          ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
          { role: "user", content: prompt },
        ],
        stream: false,
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error(`Upstream HTTP ${response.status}`);
    const parsed = relayCompletionSchema.safeParse(await response.json());
    if (!parsed.success)
      throw new Error("Invalid upstream completion or token usage");
    return {
      content: parsed.data.choices[0].message.content,
      promptTokens: parsed.data.usage.prompt_tokens,
      completionTokens: parsed.data.usage.completion_tokens,
    };
  } catch {
    throw new Error(
      "Layanan AI belum dapat memproses permintaan atau melaporkan pemakaian token. Saldo tidak dipotong. Silakan coba kembali."
    );
  }
}
