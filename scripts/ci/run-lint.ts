import { discoverLintFiles, shardFiles } from "./test-sharding";

const [shard = "1", total = "1"] = process.argv.slice(2);
const files = shardFiles(discoverLintFiles(), Number(shard), Number(total));
if (!files.length) throw new Error("Empty lint shard.");
const child = Bun.spawn(
  [
    process.execPath,
    "--no-env-file",
    "node_modules/eslint/bin/eslint.js",
    "--no-warn-ignored",
    ...(Number(total) === 1 ? ["."] : files),
  ],
  { stdout: "inherit", stderr: "inherit" }
);
process.exitCode = await child.exited;
