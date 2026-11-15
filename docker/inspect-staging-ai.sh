#!/bin/sh
set -eu

# Only staging container metadata and data-schema names are emitted, never keys.
python3 - <<'PY'
import json
import pathlib
import sqlite3
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
data_dir = upstream_env.get("DATA_DIR", "/app/data")
for mount in upstream.get("Mounts", []):
    if mount["Destination"] != data_dir:
        continue
    root = pathlib.Path(mount["Source"])
    for relative in ["db.json", "db/data.sqlite"]:
        path = root / relative
        if not path.is_file():
            continue
        result["dataFormat"] = relative
        if relative.endswith(".json"):
            data = json.loads(path.read_text())
            result["dataFields"] = list(data)
            keys = data.get("apiKeys", [])
            result["apiKeyCount"] = len(keys)
            result["apiKeyFields"] = list(keys[0]) if keys else []
        else:
            database = sqlite3.connect(path.as_uri() + "?mode=ro", uri=True)
            tables = [row[0] for row in database.execute("SELECT name FROM sqlite_master WHERE type='table'")]
            result["tableNames"] = tables
            if "api_keys" in tables:
                result["apiKeyFields"] = [row[1] for row in database.execute("PRAGMA table_info(api_keys)")]
                result["apiKeyCount"] = database.execute("SELECT count(*) FROM api_keys").fetchone()[0]
            database.close()
print(json.dumps(result))
PY
