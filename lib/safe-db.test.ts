import { expect, it } from "bun:test";
import { safeDb } from "./safe-db";

it("keeps successful empty results distinct from database errors", async () => {
  expect(await safeDb(async () => [], ["fallback"])).toEqual([]);
  await expect(
    safeDb(async () => {
      throw new Error("private database detail");
    }, [])
  ).rejects.toThrow("Data belum dapat dimuat");
});
it("allows explicit static branding fallback without inventing business data", async () => {
  expect(
    await safeDb(
      async () => {
        throw Error("offline");
      },
      "Aldera Tech",
      { brandingFallback: true }
    )
  ).toBe("Aldera Tech");
});
it("permits explicit null error panels but never treats a failed list as empty", async () => {
  const fail = async () => {
    throw Error("offline");
  };
  expect(await safeDb(fail, null, { errorFallback: true })).toBeNull();
  await expect(safeDb(fail, [], { errorFallback: true })).rejects.toThrow(
    "Data belum dapat dimuat"
  );
});
