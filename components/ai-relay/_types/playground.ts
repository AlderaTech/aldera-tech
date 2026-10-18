export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  tokens?: {
    prompt: number;
    completion: number;
    cost: number;
    durationMs: number;
  };
}
