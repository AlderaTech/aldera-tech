import { describe, it, expect } from "bun:test";
import sharp from "sharp";
import { validateUploadContent } from "./upload-content";
describe("Upload content validation across runtimes", () => {
  it("rejects HTML labeled as a small PNG and truncated images", async () => {
    await expect(
      validateUploadContent(
        Buffer.from("<html><script>alert(1)</script></html>"),
        "image/png"
      )
    ).rejects.toThrow();
    await expect(
      validateUploadContent(Buffer.from("89504e470d0a1a0a", "hex"), "image/png")
    ).rejects.toThrow();
  });
  it("uses a canonical image extension and re-encodes content even below 200 KB", async () => {
    const image = await sharp({
      create: { width: 2, height: 2, channels: 4, background: "white" },
    })
      .png()
      .toBuffer();
    const saved = await validateUploadContent(image, "image/png");
    expect(saved.ext).toBe(".webp");
    expect((await sharp(saved.buffer).metadata()).format).toBe("webp");
  });
  it("checks PDF/Office signatures and never derives an extension from the filename", async () => {
    await expect(
      validateUploadContent(
        Buffer.from("<svg onload=alert(1)>"),
        "application/pdf"
      )
    ).rejects.toThrow();
    await expect(
      validateUploadContent(
        Buffer.from("text"),
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
    ).rejects.toThrow();
    expect(
      (
        await validateUploadContent(
          Buffer.from("%PDF-1.7\ncontent"),
          "application/pdf"
        )
      ).ext
    ).toBe(".pdf");
  });
});
