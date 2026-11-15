#!/bin/sh
set -eu

# Only staging container metadata and data-schema names are emitted, never keys.
python3 - <<'PY'
import json
import subprocess

def inspect(name):
    return json.loads(subprocess.check_output(["docker", "inspect", name]))[0]

def environment(container):
    return dict(item.split("=", 1) for item in container["Config"]["Env"] if "=" in item)

web = inspect("aldera-tech-staging")
upstream = inspect("aldera-router-staging-9router")
web_env = environment(web)
upstream_env = environment(upstream)
key = web_env.get("NINE_ROUTER_API_KEY", "").strip()
initial = upstream_env.get("INITIAL_PASSWORD", "")
result = {
    "webKeyConfigured": bool(key),
    "webKeyMatchesDashboardPassword": bool(key and initial and key == initial),
    "upstreamImage": upstream["Config"]["Image"],
}
print(json.dumps(result))
program = r'''
const fs = require("fs"), path = require("path");
const directory = process.env.DATA_DIR || "/app/data";
const filename = path.join(directory, "db.json");
if (fs.existsSync(filename)) {
  const data = JSON.parse(fs.readFileSync(filename, "utf8"));
  const keys = Array.isArray(data.apiKeys) ? data.apiKeys : [];
  console.log(JSON.stringify({dataFormat:"db.json",dataFields:Object.keys(data),apiKeyCount:keys.length,apiKeyFields:keys[0] ? Object.keys(keys[0]) : []}));
} else {
  console.log(JSON.stringify({dataFormat:fs.existsSync(path.join(directory,"db/data.sqlite")) ? "sqlite" : "unknown"}));
}
'''
subprocess.run(["docker", "exec", "-i", "aldera-router-staging-9router", "node"], input=program.encode(), check=True)
PY
