import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { getTelegramConfig, sendTelegramMessage } from "./telegram";

describe("lib/telegram.ts unit tests", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.TELEGRAM_API_BASE_URL;
    delete process.env.TELEGRAM_MOCK_URL;
    delete process.env.TELEGRAM_API_URL;
    delete process.env.TELEGRAM_API_SERVER;
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.BOT_TOKEN;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns default production base URL and undefined token when env is unset", () => {
    const config = getTelegramConfig();
    expect(config.baseUrl).toBe("https://api.telegram.org");
    expect(config.botToken).toBeUndefined();
    expect(config.isMockMode).toBe(false);
  });

  it("resolves TELEGRAM_API_BASE_URL with trailing slash stripped", () => {
    process.env.TELEGRAM_API_BASE_URL = "http://localhost:9094///";
    const config = getTelegramConfig();
    expect(config.baseUrl).toBe("http://localhost:9094");
    expect(config.isMockMode).toBe(true);
    expect(config.botToken).toBe("test_mock_token");
  });

  it("resolves TELEGRAM_MOCK_URL when TELEGRAM_API_BASE_URL is not set", () => {
    process.env.TELEGRAM_MOCK_URL = "http://127.0.0.1:9094";
    const config = getTelegramConfig();
    expect(config.baseUrl).toBe("http://127.0.0.1:9094");
    expect(config.isMockMode).toBe(true);
    expect(config.botToken).toBe("test_mock_token");
  });

  it("preserves explicit BOT_TOKEN even in mock mode", () => {
    process.env.TELEGRAM_MOCK_URL = "http://127.0.0.1:9094";
    process.env.TELEGRAM_BOT_TOKEN = "custom_token_123";
    const config = getTelegramConfig();
    expect(config.baseUrl).toBe("http://127.0.0.1:9094");
    expect(config.botToken).toBe("custom_token_123");
  });

  it("returns error on missing or empty chatId", async () => {
    const res = await sendTelegramMessage({
      chatId: "",
      text: "Hello",
    });
    expect(res.success).toBe(false);
    expect(res.error).toBe("Invalid Telegram chat ID");
  });

  it("simulates message when no token is configured in production mode", async () => {
    const res = await sendTelegramMessage({
      chatId: "123456",
      text: "Test simulated message",
    });
    expect(res.success).toBe(true);
    expect(res.simulated).toBe(true);
  });
});
